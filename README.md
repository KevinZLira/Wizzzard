# KVN Console

Busca de efeitos e transições para Adobe Premiere Pro, com favoritos,
histórico e um hub de atalhos. No Windows, plugin e auxiliar são instalados
juntos pelo **KVN command.exe**.

## Uso no Windows

1. Feche o Premiere e execute o instalador.
2. Abra **Janela > Extensões > KVN Console - Atalhos**.
3. Escolha uma tecla para **KVN Console** e clique em **Concluir**.
4. Use o atalho na timeline para abrir a busca. **Esc** fecha a busca.

O hub aceita tecla única ou combinação e também permite atribuir um atalho
para abrir o próprio hub. Os atalhos ficam ativos no Premiere e nas suas
janelas CEP. O auxiliar inicia automaticamente e encerra com o aplicativo.

## Gerar o instalador

Requisitos: Windows com .NET Framework 4.5 ou superior e o compilador C# do
.NET Framework. Não é necessário instalar dependências npm.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\windows\build.ps1
```

Resultado: **`dist\KVN command.exe`**. Esse é o arquivo para distribuição.
O auxiliar é compilado em `kvn-command\helper\KVNConsoleHotkey.exe` e incluído
automaticamente no instalador. Não deve ser distribuído separadamente.

O instalador atual não tem assinatura digital e habilita `PlayerDebugMode`
para carregar a extensão CEP não assinada no usuário atual. A remoção fica
disponível em **Aplicativos** do Windows.

## Desenvolvimento e testes

Depois de gerar o instalador:

```powershell
node .\tests\hotkey.test.js
node .\tests\shortcut-hub.test.js
```

O roteiro de validação no Premiere está em [TESTAR-WINDOWS.md](TESTAR-WINDOWS.md).

- `kvn-command/`: extensão CEP, busca, hub, identidade visual e scripts do Premiere.
- `windows/`: fontes do auxiliar de atalhos, instalador e script de build.
- `tests/`: persistência, comunicação, captura de tecla e ciclo de vida do auxiliar.

O auxiliar usa `RegisterHotKey` e conversa com o background por stdin/stdout.
O hub salva configuração e acompanha confirmação em arquivos por usuário,
sem servidor de rede. A aplicação de efeitos/transições usa o QE DOM do
Premiere, que não é uma API pública suportada; mudanças de versão do Premiere
precisam ser validadas.

As configurações e diagnósticos ficam em `%APPDATA%\KVN Console`. A tecla
salva nas versões anteriores é migrada automaticamente. Identificadores CEP
e a chave de favoritos foram mantidos para preservar as preferências.

## macOS

Copie a extensão para `~/Library/Application Support/Adobe/CEP/extensions/`.
A instalação de uma extensão não assinada exige configurar o modo de
desenvolvimento correspondente à versão CEP do Premiere.

Configure **Ajustes do Sistema > Teclado > Atalhos de Teclado > Atalhos de Apps**
para Adobe Premiere Pro, com o título de menu **KVN Console**. Se já existia
um atalho com o nome antigo, atualize o título. O auxiliar Windows não roda
no macOS.

## Arquivos gerados

`dist/`, executáveis compilados, referências de estudo e configurações de
depuração ficam fora do controle de versão. O repositório contém os fontes
necessários para reproduzir o instalador.
