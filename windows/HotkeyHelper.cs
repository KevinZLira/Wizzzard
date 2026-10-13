using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

internal sealed class Binding
{
    public string id { get; set; }
    public string label { get; set; }
    public int key { get; set; }
    public int scanCode { get; set; }
    public uint modifiers { get; set; }
    public bool registered { get; set; }
    public int error { get; set; }
    public string state { get; set; }
    public uint NativeKey;
}
internal sealed class Command
{
    public string type { get; set; }
    public List<Binding> bindings { get; set; }
}
internal sealed class HotkeyWindow : Form
{
    static System.IO.TextReader Input;
    static System.IO.TextWriter Output;
    [DllImport("user32.dll", SetLastError=true)] static extern bool RegisterHotKey(IntPtr window, int id, uint modifiers, uint key);
    [DllImport("user32.dll")] static extern bool UnregisterHotKey(IntPtr window, int id);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window, out uint pid);
    [DllImport("user32.dll")] static extern IntPtr GetKeyboardLayout(uint thread);
    [DllImport("user32.dll")] static extern uint MapVirtualKeyEx(uint code, uint type, IntPtr layout);
    [DllImport("user32.dll")] static extern bool PostMessage(IntPtr window, uint message, IntPtr wParam, IntPtr lParam);
    [DllImport("kernel32.dll", SetLastError=true)] static extern IntPtr CreateToolhelp32Snapshot(uint flags, uint pid);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] static extern bool Process32First(IntPtr snapshot, ref ProcessEntry entry);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] static extern bool Process32Next(IntPtr snapshot, ref ProcessEntry entry);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] struct ProcessEntry {
        public uint size, usage, pid; public UIntPtr heap; public uint module, threads, parent; public int priority; public uint flags;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst=260)] public string executable;
    }
    const int HotkeyId=731;
    readonly JavaScriptSerializer json=new JavaScriptSerializer();
    readonly System.Windows.Forms.Timer timer=new System.Windows.Forms.Timer();
    readonly bool selfTest;
    readonly int cepPid;
    List<Binding> bindings=new List<Binding>();
    Dictionary<uint, ProcessEntry> processes=new Dictionary<uint, ProcessEntry>();
    DateTime snapshotAt=DateTime.MinValue, retryAt=DateTime.MinValue, suspendedUntil=DateTime.MinValue;
    string lastStatus="";
    bool closing;
    public int Result;
    public HotkeyWindow(bool test, int parent)
    {
        selfTest=test; cepPid=parent; ShowInTaskbar=false; FormBorderStyle=FormBorderStyle.None; Opacity=0;
        var handle=Handle;
        Emit("ready", "Auxiliar iniciado", null);
        if (test) { RunSelfTest(); return; }
        timer.Interval=150; timer.Tick += delegate { Tick(); }; timer.Start();
        Thread input=new Thread(ReadInput); input.IsBackground=true; input.Start();
    }
    protected override void SetVisibleCore(bool value) { base.SetVisibleCore(false); }
    void Emit(string type, string message, string action)
    {
        try {
            Output.WriteLine(json.Serialize(new { type=type, message=message, action=action, bindings=bindings,
                shortcut=bindings.Count>0 ? bindings[0].label : "", error=bindings.Sum(b=>b.error) })); Output.Flush();
        } catch { if (!closing) Close(); }
    }
    void Publish(string state, string message)
    {
        string signature=state+json.Serialize(bindings);
        if (signature==lastStatus) return; lastStatus=signature; Emit(state,message,null);
    }
    void RefreshProcesses()
    {
        if (DateTime.UtcNow<snapshotAt) return;
        snapshotAt=DateTime.UtcNow.AddSeconds(2);
        var snapshot=CreateToolhelp32Snapshot(2,0);
        if (snapshot==new IntPtr(-1)) return;
        try {
            var next=new Dictionary<uint, ProcessEntry>();
            var entry=new ProcessEntry(); entry.size=(uint)Marshal.SizeOf(typeof(ProcessEntry));
            if (Process32First(snapshot,ref entry)) do { next[entry.pid]=entry; } while (Process32Next(snapshot,ref entry));
            processes=next;
        } finally { CloseHandle(snapshot); }
    }
    uint PremiereAncestor(uint pid)
    {
        for (int depth=0; depth<16; depth++) {
            ProcessEntry entry;
            if (!processes.TryGetValue(pid,out entry)) return 0;
            if (String.Equals(entry.executable,"Adobe Premiere Pro.exe",StringComparison.OrdinalIgnoreCase)) return pid;
            if (!String.Equals(entry.executable,"CEPHtmlEngine.exe",StringComparison.OrdinalIgnoreCase)) return 0;
            if (entry.parent==pid) return 0; pid=entry.parent;
        }
        return 0;
    }
    bool PremiereHasFocus(out IntPtr layout)
    {
        uint foregroundPid; uint thread=GetWindowThreadProcessId(GetForegroundWindow(),out foregroundPid);
        layout=GetKeyboardLayout(thread); RefreshProcesses();
        uint foregroundHost=PremiereAncestor(foregroundPid);
        if (foregroundHost==0) return false;
        // Restrict to the Premiere instance owning this CEP background.
        return cepPid==0 || foregroundHost==PremiereAncestor((uint)cepPid);
    }
    void Release()
    {
        for (int i=0;i<bindings.Count;i++) {
            if (bindings[i].registered) UnregisterHotKey(Handle,HotkeyId+i);
            bindings[i].registered=false;
        }
    }
    void Tick()
    {
        IntPtr layout;
        if (bindings.Count==0) return;
        if (DateTime.UtcNow<suspendedUntil) {
            Release(); foreach (var b in bindings) b.state="capturing";
            Publish("capturing","Pressione a tecla desejada; Esc cancela"); return;
        }
        if (!PremiereHasFocus(out layout)) {
            Release(); foreach (var b in bindings) b.state=b.key==0 ? "disabled" : "waiting";
            Publish("waiting","Pronto para usar quando o Premiere estiver em foco"); return;
        }
        bool retry=DateTime.UtcNow>=retryAt;
        for (int i=0;i<bindings.Count;i++) {
            Binding b=bindings[i];
            if (b.key==0) { b.state="disabled"; continue; }
            uint virtualKey=b.scanCode>0 ? MapVirtualKeyEx((uint)b.scanCode,3,layout) : (uint)b.key;
            if (b.registered && virtualKey!=b.NativeKey) { UnregisterHotKey(Handle,HotkeyId+i); b.registered=false; }
            if (b.registered || !retry) continue;
            b.NativeKey=virtualKey;
            b.registered=virtualKey>0 && RegisterHotKey(Handle,HotkeyId+i,b.modifiers|0x4000,virtualKey);
            b.error=b.registered ? 0 : Marshal.GetLastWin32Error(); b.state=b.registered ? "active" : "conflict";
        }
        if (retry) retryAt=DateTime.UtcNow.AddSeconds(2);
        bool conflict=bindings.Any(b=>b.state=="conflict");
        Publish(conflict ? "conflict" : "active",conflict ? "Tecla em uso. Escolha outra tecla." : "Atalhos ativos no Premiere");
    }
    void Configure(List<Binding> requested)
    {
        if (requested==null || requested.Count!=2 || requested[0].id!="palette" || requested[1].id!="shortcuts" || requested.Any(b=>
            b.label==null || b.label.Length>80 || b.key<0 || b.key>254 || b.key==123 || b.scanCode<0 || b.scanCode>127 || b.modifiers>7 ||
            new[]{16,17,18,91,92}.Contains(b.key))) { Emit("invalid","Configuracao de tecla invalida",null); return; }
        if (requested[0].key!=0 && requested[1].key!=0 && requested[0].key==requested[1].key && requested[0].scanCode==requested[1].scanCode && requested[0].modifiers==requested[1].modifiers) {
            Emit("invalid","Escolha teclas diferentes para cada acao",null); return;
        }
        Release(); bindings=requested;
        foreach (Binding b in bindings) { b.registered=false; b.error=0; b.state="waiting"; }
        suspendedUntil=DateTime.MinValue; retryAt=DateTime.MinValue; lastStatus=""; Tick();
    }
    void ReadInput()
    {
        try {
            string line;
            while ((line=Input.ReadLine())!=null) {
                if (line.Length>8192) break;
                Command command=json.Deserialize<Command>(line);
                if (command==null) continue;
                if (command.type=="stop") break;
                BeginInvoke(new Action(delegate {
                    if (command.type=="configure") Configure(command.bindings);
                    else if (command.type=="suspend") { suspendedUntil=DateTime.UtcNow.AddSeconds(30); Tick(); }
                    else if (command.type=="resume") { suspendedUntil=DateTime.MinValue; retryAt=DateTime.MinValue; Tick(); }
                }));
            }
        } catch { }
        try { BeginInvoke(new Action(Close)); } catch { }
    }
    protected override void WndProc(ref Message message)
    {
        if (message.Msg==0x0312) {
            int index=message.WParam.ToInt32()-HotkeyId;
            if (selfTest) { Emit("self-test","WM_HOTKEY delivered",null); Result=0; Close(); }
            else if (index>=0 && index<bindings.Count && bindings[index].registered) {
                IntPtr layout; if (PremiereHasFocus(out layout)) Emit("open","Abrir",bindings[index].id);
            }
        }
        base.WndProc(ref message);
    }
    void RunSelfTest()
    {
        // Regression: Premiere-owned CEP windows count as host focus, other hosts don't.
        processes=new Dictionary<uint,ProcessEntry> {
            {100,new ProcessEntry {pid=100,executable="Adobe Premiere Pro.exe",parent=1}},
            {101,new ProcessEntry {pid=101,executable="CEPHtmlEngine.exe",parent=100}},
            {102,new ProcessEntry {pid=102,executable="CEPHtmlEngine.exe",parent=101}},
            {200,new ProcessEntry {pid=200,executable="Adobe Photoshop.exe",parent=1}},
            {201,new ProcessEntry {pid=201,executable="CEPHtmlEngine.exe",parent=200}}
        };
        if (PremiereAncestor(102)!=100 || PremiereAncestor(201)!=0) { Result=6; return; }
        bindings.Add(new Binding { id="palette",label="test" });
        bindings[0].registered=RegisterHotKey(Handle,HotkeyId,0x4003,0x87);
        if (!bindings[0].registered) { Result=1; Emit("self-test-failed","Cannot register test combination",null); return; }
        bool duplicate=RegisterHotKey(Handle,HotkeyId+1,0x4003,0x87);
        if (duplicate) { UnregisterHotKey(Handle,HotkeyId+1); Result=2; Release(); return; }
        Release(); bindings[0].registered=RegisterHotKey(Handle,HotkeyId,0x4003,0x87);
        if (!bindings[0].registered) { Result=3; return; }
        Release(); bindings[0].registered=RegisterHotKey(Handle,HotkeyId,0x4000,0x87); // single key
        if (!bindings[0].registered) { Result=5; return; }
        PostMessage(Handle,0x0312,new IntPtr(HotkeyId),IntPtr.Zero);
        timer.Interval=3000; timer.Tick += delegate { Result=4; Close(); }; timer.Start();
    }
    protected override void OnFormClosed(FormClosedEventArgs e) { closing=true; timer.Stop(); Release(); base.OnFormClosed(e); }
    [STAThread] static int Main(string[] args)
    {
        bool test=args.Length==1 && args[0]=="--self-test"; int parent=0;
        if (args.Length==2 && args[0]=="--cep-pid") Int32.TryParse(args[1],out parent);
        try {
            Input=new System.IO.StreamReader(Console.OpenStandardInput(),new System.Text.UTF8Encoding(false));
            Output=new System.IO.StreamWriter(Console.OpenStandardOutput(),new System.Text.UTF8Encoding(false));
            using (var window=new HotkeyWindow(test,parent)) {
            if (test && window.Result!=0) return window.Result;
            Application.Run(new ApplicationContext(window)); return window.Result;
        } } catch (Exception error) { Console.Error.WriteLine(error.Message); return 10; }
    }
}
