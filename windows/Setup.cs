using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;
using System.Xml;
using Microsoft.Win32;

[assembly: AssemblyTitle("KVN command")]
[assembly: AssemblyProduct("KVN Console")]
[assembly: AssemblyCompany("KVN")]
[assembly: AssemblyDescription("Instalador do KVN Console e do hub de atalhos")]
[assembly: AssemblyVersion("0.3.5.0")]
[assembly: AssemblyFileVersion("0.3.5.0")]

internal static class Setup
{
    static readonly string Target=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Adobe", "CEP", "extensions", "kvn-command");
    static readonly string AppFolder=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "KVN Console");
    const string UninstallKey=@"Software\Microsoft\Windows\CurrentVersion\Uninstall\KVN Console";
    static ZipArchive Payload() { return new ZipArchive(Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"), ZipArchiveMode.Read); }
    static void Verify(ZipArchive zip)
    {
        if (zip.GetEntry("CSXS/manifest.xml")==null || zip.GetEntry("helper/KVNConsoleHotkey.exe")==null) throw new Exception("Incomplete installer payload.");
        foreach (ZipArchiveEntry entry in zip.Entries) {
            string full=Path.GetFullPath(Path.Combine(Target, entry.FullName));
            if (!full.StartsWith(Target+Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) throw new Exception("Invalid package path.");
            using (Stream source=entry.Open()) source.CopyTo(Stream.Null);
        }
        var manifest=new XmlDocument();
        using (Stream source=zip.GetEntry("CSXS/manifest.xml").Open()) manifest.Load(source);
        var hub=manifest.SelectSingleNode("//DispatchInfoList/Extension[@Id='com.kvn.command.shortcuts']/DispatchInfo/Lifecycle/AutoVisible");
        var background=manifest.SelectSingleNode("//DispatchInfoList/Extension[@Id='com.kvn.command.bg']/DispatchInfo/Lifecycle/AutoVisible");
        if (hub==null || hub.InnerText!="true" || background==null || background.InnerText!="false") throw new Exception("Invalid UI visibility in installer manifest.");
    }
    static bool Owned(string folder)
    {
        string manifest=Path.Combine(folder,"CSXS","manifest.xml");
        if (!File.Exists(manifest)) return false;
        var xml=new XmlDocument(); xml.Load(manifest);
        return xml.DocumentElement.GetAttribute("ExtensionBundleId")=="com.kvn.command";
    }
    static void CheckClosed()
    {
        if (Process.GetProcessesByName("Adobe Premiere Pro").Length>0 || Process.GetProcessesByName("KVNConsoleHotkey").Length>0 || Process.GetProcessesByName("WizzzardHotkey").Length>0)
            throw new Exception("Feche o Premiere antes de instalar ou remover o KVN Console.");
    }
    static void Install()
    {
        CheckClosed();
        if (Directory.Exists(Target) && !Owned(Target)) throw new Exception("A pasta de destino existe e nao pertence ao KVN Console.");
        Directory.CreateDirectory(AppFolder);
        string staging=Path.Combine(AppFolder,"staging-"+Guid.NewGuid().ToString("N"));
        string backup=Path.Combine(AppFolder,"backup-"+Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(staging);
        bool previous=false, replaced=false;
        try {
            using (var zip=Payload()) { Verify(zip); zip.ExtractToDirectory(staging); }
            Directory.CreateDirectory(Path.GetDirectoryName(Target));
            if (Directory.Exists(Target)) { Directory.Move(Target,backup); previous=true; }
            Directory.Move(staging,Target); replaced=true;
            string uninstaller=Path.Combine(AppFolder,"Uninstall.exe");
            string ownPath=Assembly.GetExecutingAssembly().Location;
            if (!ownPath.Equals(uninstaller,StringComparison.OrdinalIgnoreCase)) File.Copy(ownPath,uninstaller,true);
            // Development build: CEP requires debug mode until a signed ZXP is available.
            for (int version=9; version<=12; version++) using (RegistryKey key=Registry.CurrentUser.CreateSubKey(@"Software\Adobe\CSXS."+version)) key.SetValue("PlayerDebugMode","1",RegistryValueKind.String);
            using (RegistryKey key=Registry.CurrentUser.CreateSubKey(UninstallKey)) {
                key.SetValue("DisplayName","KVN Console"); key.SetValue("DisplayVersion","0.3.5");
                key.SetValue("Publisher","KVN Console"); key.SetValue("InstallLocation",Target);
                key.SetValue("UninstallString","\""+uninstaller+"\" --uninstall");
                key.SetValue("NoModify",1); key.SetValue("NoRepair",1);
            }
            Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\Wizzzard",false);
        } catch {
            if (replaced && Owned(Target)) Directory.Delete(Target,true);
            if (previous && Directory.Exists(backup)) Directory.Move(backup,Target);
            throw;
        } finally { if (Directory.Exists(staging)) Directory.Delete(staging,true); }
        // Retain the previous version outside Adobe's extension scan for recovery.
    }
    static void Uninstall()
    {
        CheckClosed();
        if (Directory.Exists(Target)) {
            if (!Owned(Target)) throw new Exception("A pasta de destino nao pertence ao KVN Console.");
            Directory.Delete(Target,true);
        }
        Registry.CurrentUser.DeleteSubKeyTree(UninstallKey,false);
        // Preserve user preferences, backups and shared Adobe debug settings.
    }
    [STAThread] static int Main(string[] args)
    {
        try {
            if (args.Length==1 && args[0]=="--verify") { using (var zip=Payload()) Verify(zip); Console.WriteLine("Payload verified"); return 0; }
            Application.EnableVisualStyles();
            bool remove=args.Length==1 && args[0]=="--uninstall";
            string prompt=remove ? "Remover o KVN Console deste usuario? Feche o Premiere primeiro." :
                "Instalar o KVN Console para este usuario?\n\nFeche o Premiere primeiro. A busca e o hub de atalhos serao instalados juntos.\n\nEste instalador habilita o carregamento de extensoes CEP nao assinadas para este usuario.";
            if (MessageBox.Show(prompt,"KVN Console",MessageBoxButtons.OKCancel,MessageBoxIcon.Information)!=DialogResult.OK) return 0;
            if (remove) Uninstall(); else Install();
            MessageBox.Show(remove ? "KVN Console removido." : "Instalado! Abra o Premiere e acesse Janela > Extensoes > KVN Console - Atalhos.\n\nClique em Escolher tecla ao lado de KVN Console e pressione a tecla desejada. Depois clique em Concluir.","KVN Console");
            return 0;
        } catch (Exception error) {
            if (args.Length==1 && args[0]=="--verify") Console.Error.WriteLine(error.Message);
            else MessageBox.Show(error.Message,"KVN Console",MessageBoxButtons.OK,MessageBoxIcon.Error);
            return 1;
        }
    }
}
