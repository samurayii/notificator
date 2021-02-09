# Telegram

## Описание

Этот канал для отправки результата работы в [**telegram**](https://telegram.org) мессенджер.

## Настройка

Канал настраивается в конфигурационном файле, в секции **notifications.channels**, ключ **type** должен быть равен **telegram**.

### Секции файла конфигурации

- **основной** - общая настройка канала
- **proxy** - настройки прокси (НЕ ОБЯЗАТЕЛЬНО)
- **proxy.auth** - авторизация для прокси сервера (НЕ ОБЯЗАТЕЛЬНО)

### Таблица параметров:

| Параметр | Тип | Значение | Описание |
| ----- | ----- | ----- | ----- |
| enable | логический | false | активация канала |
| name | строка | нет | имя канала (должно быть уникальным) |
| type | строка | нет | тип канала |
| token | строка | нет | токен бота |
| chat_id | строка | нет | идентификатор чата |
| attempts | число | 2 | количество попыток |
| attempt_interval | число | 10 | интервал повтора попытки при неудачи |
| timeout | число | 10 | время запроса в секундах |
| parse_mode | строка | нет | тип сообщения (Markdown|HTML) (НЕ ОБЯЗАТЕЛЬНО) |
| template | строка | нет | путь к шаблону в формате handlebars (НЕ ОБЯЗАТЕЛЬНО) |
| proxy.protocol | строка | http | протокол (http|https) |
| proxy.host | строка | нет | адрес прокси сервера |
| proxy.port | число | нет | порт прокси сервера |
| proxy.auth.username | строка | нет | пользователь |
| proxy.auth.password | строка | нет | пароль |

### Пример файла конфигурации

```toml
[notifications]                 # настройка оповещений
    path = "channels"           # папка с отдельным описанием каналов 
    [[notifications.channels]]  # массив каналов
        enable = false                          # активация канала
        name = "telegram"                       # имя канала
        type = "telegram"                       # тип канала
        token = "xxxxxxxxxxx"                   # токен бота
        chat_id = "-xxxxxxxxx"                  # идентификатор чата
        attempts = 3                            # количество попыток
        attempt_interval = 10                   # интервал повтора попытки при неудачи
        timeout = 10                            # время запроса в секундах
        parse_mode = "markdown"                 # тип сообщения (markdown|html)
        #template = ""                          # путь к шаблону в формате handlebars (НЕ ОБЯЗАТЕЛЬНО)
        [notifications.channels.proxy]          # настройки прокси (НЕ ОБЯЗАТЕЛЬНО)
            protocol = "http"                   # протокол (http|https)
            host = '127.0.0.1'                  # адрес прокси сервера
            port = 9000                         # порт прокси сервера
            [notifications.channels.proxy.auth] # авторизация для прокси сервера (НЕ ОБЯЗАТЕЛЬНО)
                username = 'mikeymike'          # пользователь прокси
                password = 'rapunz3l'           # пароль к прокси
```

### Пример отдельного файла конфигурации канала

```toml
enable = false                          # активация канала
name = "telegram"                       # имя канала
type = "telegram"                       # тип канала
token = "xxxxxxxxxxx"                   # токен бота
chat_id = "-xxxxxxxxx"                  # идентификатор чата
attempts = 3                            # количество попыток
attempt_interval = 10                   # интервал повтора попытки при неудачи
timeout = 10                            # время запроса в секундах
parse_mode = "markdown"                 # тип сообщения (markdown|html)
#template = ""                          # путь к шаблону в формате handlebars (НЕ ОБЯЗАТЕЛЬНО)
[proxy]                                 # настройки прокси (НЕ ОБЯЗАТЕЛЬНО)
    protocol = "http"                   # протокол (http|https)
    host = '127.0.0.1'                  # адрес прокси сервера
    port = 9000                         # порт прокси сервера
    [proxy.auth]                        # авторизация для прокси сервера (НЕ ОБЯЗАТЕЛЬНО)
        username = 'mikeymike'          # пользователь прокси
        password = 'rapunz3l'           # пароль к прокси
```

### Шаблоны для сообщений

Используемый шаблонизатор [**handlebars**](https://handlebarsjs.com/), все шаблоны должны иметь расширение **.hbs**, путь к шаблону указывается в настройках канала ключом **template**.  
Список дополнительных хелперов:

- if_eq - проверяет соответствие. пример: {{#if_eq global true}}

#### Пример применения шаблона

```js
module.exports = function () {
    this.alert("alert message");
}
```

#### Данные передаваемые шаблонизатору

```js
{
    job: "asdasd",          // идентификатор задачи
    module: "module1",      // имя модуля
    global: true,           // тип задачи
    status: "alert",        // тип сообщения
    repeat: false,          // флаг повторения
    timestamp: 213213123,   // время срабатывания
    data: "данные"          // данные пользователя
}
```

#### Шаблон по умолчанию

```txt
Type: {{type}}, message: {{data}}
```

#### Пример данных для шаблона

```js
module.exports = function () {
    this.alert({
        color: "red",
        message: "Внимание",
        tags: ["tag1", "tag2"],
        keys: {
            key1: "val-key1",
            key1: "val-key1"
        }
    });
}
```

#### Собственный шаблон

```txt
{{#if_eq type "alert"}}
Alert!
{{/if_eq}}
message: {{data.message}}
trigget: {{data.trigger}}
```
