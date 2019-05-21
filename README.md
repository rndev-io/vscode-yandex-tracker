# vscode-yandex-tracker

VSCode and [Yandex.Tracker](https://yandex.ru/tracker/) integration

## Installation

Install extension from [Marketplace](https://marketplace.visualstudio.com/items?itemName=rusnasonov.vscode-yandex-tracker)

## Authorization

For Authorisation you need to get OAuth token and Organization ID. See [Api Access](https://tech.yandex.ru/connect/tracker/api/concepts/access-docpage/).

1. Run command `Yandex.Tracker: Setup OAuth token` in command pallet and pass token.
2. Open `Settings` and set `Organizatio ID`.
3. Reload window with `Developer: Reload Window` command.

Token stored in system Keychain.

## Features

### Sidebar

You can view you issues on sidebar. 

![Sidebar](https://github.com/rusnasonov/vscode-yandex-tracker/blob/master/resources/screenshots/sidebar.png)

You can explore issues with three filters — `Assign To Me`, `Followed By Me`, `Custom Query`.

`Custom Query` filter can be changed in `Settings -> Query` field. See [Query Language](https://yandex.ru/tracker/support/user/query-filter.html).