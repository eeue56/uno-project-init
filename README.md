# uno-project-init
Create all the boilerplate needed for an Uno project via a single command


## Install

You need to have a global `uno`

```
sudo npm install -g uno-project-init
```


## Example

```
PS C:\Users\Noah\dev\uno-project-init> uno-project-init --help
Usage: index.js <project name>

Options:
  -v, --verbose  Output more stuff
  -t, --target   Choose target platform. Defaults to ios
  -h, --help     Show help                                             [boolean]
  -u, --uno      Specify a path to the `uno` binary

Examples:
  uno-project-init --uno ~/dev/uno/uno  Use `uno create` using the binary provided
```