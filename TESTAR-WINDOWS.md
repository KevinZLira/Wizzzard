# KVN Console 0.3.5 — hub de atalhos

1. Salve o projeto e feche o Premiere.
2. Execute `dist\KVN command.exe`.
3. Abra o Premiere. Acesse **Janela > Extensoes > KVN Console - Atalhos**.
4. Clique no botao da tecla ao lado de **KVN Console** e pressione **'**.
   A atribuicao e salva automaticamente. Clique em **Concluir**.
5. Clique na timeline e pressione **'** para abrir a busca.
6. Pressione **Esc** para fechar a busca e repita o atalho.

O hub lista **KVN Console** (busca) e **Atalhos do KVN Console** (o proprio hub).
Ambos aceitam uma tecla unica ou uma combinacao. `Esc` cancela a captura.
O botao × remove uma atribuicao. Teclas duplicadas sao recusadas.
A tecla Windows e F12 nao sao oferecidas. Os atalhos sao suspensos durante
captura e retomados automaticamente; os atalhos nao rodam fora do Premiere.
Janelas CEP pertencentes ao Premiere agora contam como parte do aplicativo.
A verificacao de foco ocorre a cada 150 ms.

O hub tambem pode ser aberto pelas configuracoes da busca. Os menus agora sao KVN Console e KVN Console - Atalhos. No macOS, atualize o titulo do App Shortcut existente para KVN Console.

## Diagnostico

O estado aparece no hub, por acao. O log proprio fica em:
`%APPDATA%\KVN Console\shortcut.log`.
Os atalhos salvos ficam em `%APPDATA%\KVN Console\hotkey.json`.
O log registra configuracao, estado do auxiliar e pedidos de abertura;
nao registra as teclas digitadas durante edicao.

## Verificacao realizada

- Compilacao do auxiliar e do instalador unico.
- Teste nativo: registro de atalho, conflito, liberacao, tecla unica e WM_HOTKEY.
- Regressao da identificacao de janelas CEP pertencentes ao Premiere.
- Testes da captura de aspas em teclados US e ABNT, combinacoes e cancelamento.
- Ponte CEP, atribuicoes duplicadas, falhas e limite de reinicio.
- Encerramento do auxiliar quando o pipe pai fecha.
- Integridade do pacote do instalador.

O teste de tecla real e foco dentro do Premiere ainda deve ser feito.
O teste nativo usa F24 brevemente e nao envia teclas ao Premiere.

## Desenvolvimento

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\windows\build.ps1
node .\tests\hotkey.test.js
node .\tests\shortcut-hub.test.js
```

Esta e uma versao de teste nao assinada; o instalador habilita PlayerDebugMode
para CEP 9–12. Plugin, hub e auxiliar sao incluidos no mesmo instalador, sem
servico nem entrada de inicializacao do Windows. O instalador recusa mudancas
com Premiere/auxiliar abertos. A versao anterior fica em
`%LOCALAPPDATA%\KVN Console\backup-*`. Remocao pelo menu Aplicativos do Windows.