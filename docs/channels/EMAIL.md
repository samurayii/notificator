# Email

## Описание

Этот канал для отправки результата работы по email.

## Настройка

Канал настраивается в настраиваются в конфигурационном файле, в секции **notifications.channels**, ключ **type** должен быть равен **email**.

### Секции файла конфигурации

- **основной** - общая настройка канала
- **auth** - авторизация для сервера (НЕ ОБЯЗАТЕЛЬНО)

### Таблица параметров:

| Параметр | Тип | Значение | Описание |
| ----- | ----- | ----- | ----- |
| enable | логический | false | активация канала |
| name | строка | нет | имя канала (должно быть уникальным) |
| output_type | строка | нет | тип канала |
| attempts | число | 2 | количество попыток |
| attempt_interval | число | 10 | интервал повтора попытки при неудачи |
| host | строка | smtp.localhost | адрес сервера
| port | число | 465 | порт сервера
| from | строка | alarmist@localhost.com | почта отправителя, по умолчанию
| to | строка | нет | адресаты, по умолчанию
| cc | строка | нет | адресаты для копии, по умолчанию (НЕ ОБЯЗАТЕЛЬНО)
| bcc | строка | нет | адресаты для скрытой копии, по умолчанию (НЕ ОБЯЗАТЕЛЬНО)
| subject | строка | empty | тема письма, по умолчанию
| secure | логический| false | использовать TLS
| ignore_tls | логический | false | игнорировать TLS сервера
| parse_mode | строка | Text | тип письма (Text или HTML) |
| template | строка | нет | путь к шаблону в формате handlebars (НЕ ОБЯЗАТЕЛЬНО) |
| auth.type | строка | login | тип авторизации (login или oauth2) |
| auth.username | строка | нет | пользователь |
| auth.password | строка | нет | пароль |
| auth.client_id | строка | нет | идентификатор клиента, только oauth2 (НЕ ОБЯЗАТЕЛЬНО) |
| auth.client_secret | строка | нет | секрет, только oauth2 (НЕ ОБЯЗАТЕЛЬНО) |
| auth.refresh_token | строка | нет | токен обновление, только oauth2 (НЕ ОБЯЗАТЕЛЬНО) |
| auth.access_token | строка | нет | токен доступа, только oauth2 (НЕ ОБЯЗАТЕЛЬНО) |
| auth.expires | число | нет | время устаревания токена, только oauth2 (НЕ ОБЯЗАТЕЛЬНО) |
| auth.access_url | строка | нет | путь доступа (НЕ ОБЯЗАТЕЛЬНО) |
| auth.service_client | строка | нет | идентификатор клиента сервиса (НЕ ОБЯЗАТЕЛЬНО) |
| auth.private_key | строка | нет | сертификат (НЕ ОБЯЗАТЕЛЬНО) |

### Пример файла конфигурации

```toml
[notifications]                 # настройка оповещений
    path = "channels"           # папка с отдельным описанием каналов 
    [[notifications.channels]]              # список каналов
        enable = false                      # активация канала
        name = "email"                      # имя канала
        type = "email"                      # тип канала
        host = "smtp.localhost"             # адрес сервера
        port = 465                          # порт сервера
        from = "alarmist@localhost.com"     # почта отправителя, по умолчанию
        to = ""                             # адресаты, по умолчанию
        #cc = ""                            # адресаты для копии, по умолчанию (НЕ ОБЯЗАТЕЛЬНО)
        #bcc = ""                           # адресаты для скрытой копии, по умолчанию (НЕ ОБЯЗАТЕЛЬНО)
        subject = "empty"                   # тема письма, по умолчанию
        secure = false                      # использовать TLS
        ignore_tls = false                  # игнорировать TLS сервера
        attempts = 3                        # количество попыток
        attempt_interval = 10               # интервал повтора попытки при неудачи
        parse_mode = "text"                 # тип письма (Text или HTML)
        #template = ""                      # путь к шаблону в формате handlebars (НЕ ОБЯЗАТЕЛЬНО)
        [notifications.channels.auth]                                       # авторизация для прокси сервера (НЕ ОБЯЗАТЕЛЬНО)
            type = "login"                                                  # тип авторизации (login или oauth2)
            username = "mikeymike"                                          # пользователь прокси
            password = "rapunz3l"                                           # пароль к прокси
            client_id = "000000000000-xxx0.apps.googleusercontent.com"      # идентификатор клиента, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
            client_secret = "XxxxxXXxX0xxxxxxxx0XXxX0"                      # секрет, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
            refresh_token = "1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx"       # токен обновление, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
            access_token = "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x"           # токен доступа, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
            expires = 1484314697598                                         # время устаревания токена, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
            access_url = "xxxxxx"                                           # путь доступа
            service_client = "113600000000000000000"                        # идентификатор клиента сервиса
            private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg..."  # сертификат
```

### Пример отдельного файла конфигурации канала

```toml
enable = false                      # активация канала
name = "email"                      # имя канала
output_type = "email"               # тип канала
host = "smtp.localhost"             # адрес сервера
port = 465                          # порт сервера
from = "alarmist@localhost.com"     # почта отправителя, по умолчанию
to = ""                             # адресаты, по умолчанию
#cc = ""                            # адресаты для копии, по умолчанию (НЕ ОБЯЗАТЕЛЬНО)
#bcc = ""                           # адресаты для скрытой копии, по умолчанию (НЕ ОБЯЗАТЕЛЬНО)
subject = "empty"                   # тема письма, по умолчанию
secure = false                      # использовать TLS
ignore_tls = false                  # игнорировать TLS сервера
attempts = 2                        # количество попыток
attempt_interval = 10               # интервал повтора попытки при неудачи
parse_mode = "text"                 # тип письма (text|html)
#template = "email_templates"       # путь к шаблону в формате handlebars (НЕ ОБЯЗАТЕЛЬНО)
[auth]                              # авторизация для прокси сервера (НЕ ОБЯЗАТЕЛЬНО)
    type = "login"                                                  # тип авторизации (login|oauth2)
    username = "mikeymike"                                          # пользователь
    password = "rapunz3l"                                           # пароль
    client_id = "000000000000-xxx0.apps.googleusercontent.com"      # идентификатор клиента, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
    client_secret = "XxxxxXXxX0xxxxxxxx0XXxX0"                      # секрет, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
    refresh_token = "1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx"       # токен обновление, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
    access_token = "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x"           # токен доступа, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
    expires = 1484314697598                                         # время устаревания токена, только oauth2 (НЕ ОБЯЗАТЕЛЬНО)
    access_url = "xxxxxx"                                           # путь доступа (НЕ ОБЯЗАТЕЛЬНО)
    service_client = "113600000000000000000"                        # идентификатор клиента сервиса (НЕ ОБЯЗАТЕЛЬНО)
    private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg..."  # сертификат (НЕ ОБЯЗАТЕЛЬНО)
```

### Шаблоны для сообщений

Используемый шаблонизатор [**handlebars**](https://handlebarsjs.com/), все шаблоны должны иметь расширение **.hbs**, путь к шаблону указывается в настройках канала ключом **template**.  
Список дополнительных хелперов:

- if_eq

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
