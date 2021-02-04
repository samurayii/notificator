# Notificator

## Информация

Приложение для анализа метрик и оповещения об аномалиях в разные точки назначения.

## Оглавление:
- [Установка](#install)
- [Ключи запуска](#launch)
- [Конфигурация](#configuration)
- [Приёмники](RESEIVERS.md)
- [Каналы](CHANNELS.md)
- [Модули и настройки](MODULES.md)
- [HTTP API](API.md)

## <a name="install"></a> Установка и использование

пример строки запуска: `node /template/app.js -c config.toml`

## <a name="launch"></a> Таблица ключей запуска
Ключ | Описание
------------ | -------------
--version, -v | вывести номер версии приложения
--help, -h | вызвать справку по ключам запуска
--config, -c | путь к файлу конфигурации в формате toml или json, (переменная среды: NOTIFICATOR_CONFIG_PATH)

## <a name="configuration"></a> Конфигурация

Программа настраивается через файл конфигурации двух форматов TOML или JSON. Так же можно настраивать через переменные среды, которые будут считаться первичными. 

### Секции файла конфигурации

- **logger** - настройка логгера (переменная среды: NOTIFICATOR_LOGGER)
- **authorization** - настройка авторизации (переменная среды: NOTIFICATOR_AUTHORIZATION)
- **api** - настройка API (переменная среды: NOTIFICATOR_API)
- **api.parsing** - настройка парсинга API (пакет: https://github.com/dlau/koa-body#readme, переменная среды: NOTIFICATOR_API_PARSING)
- **input** - настройка INPUT API (переменная среды: NOTIFICATOR_INPUT)
- **input.parsing** - настройка парсинга INPUT API (пакет: https://github.com/dlau/koa-body#readme, переменная среды: NOTIFICATOR_INPUT_PARSING)
- **input.receivers** - настройка приёмников (переменная среды: NOTIFICATOR_INPUT_RECEIVERS)
- **input.receivers.telegraf_json** - настройка приёмника telegraf_json (переменная среды: NOTIFICATOR_INPUT_RECEIVERS_TELEGRAF_JSON)
- **input.receivers.triggers** - настройка приёмника triggers (переменная среды: NOTIFICATOR_INPUT_RECEIVERS_TRIGGERS)
- **web** - настройка статического Web сервера (переменная среды: NOTIFICATOR_WEB)
- **web.static** - настройка статического сервера (пакет: https://github.com/koajs/static) (переменная среды: NOTIFICATOR_WEB_STATIC)
- **metrics_store** - настройка хранилище метрик (переменная среды: NOTIFICATOR_METRICS_STORE)
- **metrics_store.cleaning** - настройка очистки записей (переменная среды: NOTIFICATOR_METRICS_STORE_CLEANING)
- **store** - настройка временного хранилища (переменная среды: NOTIFICATOR_STORE)
- **handlers** - настройка для обработчиков (переменная среды: NOTIFICATOR_HANDLERS)
- **notifications** - настройка оповещений (переменная среды: NOTIFICATOR_NOTIFICATIONS)

### Пример файла конфигурации config.toml

```toml
[logger]                # настройка логгера
    mode = "prod"       # режим (prod или dev или debug)
    enable = true       # активация логгера
    timestamp = "none"  # выводить время лога (none, time или full)
    type = true         # выводить тип лога (true или false)

[authorization]                     # настройка авторизации
    [[authorization.users]]         # массив пользователей
        username = "username"       # имя пользователя
        password = "password"       # пароль пользователя
    [[authorization.users]]         
        token = "xxxxxxxxxxxx"      # токен доступа

[api]                                   # настройка API
    enable = false                      # активация API
    auth = false                        # активация авторизации
    listening = "*:3001"                # настройка слушателя
    prefix = "/api"                     # префикс
    proxy = false                       # когда поле заголовка true proxy будут доверенным
    subdomain_offset = 2                # смещение от поддомена для игнорирования
    proxy_header = "X-Forwarded-For"    # заголовок IP прокси
    ips_count = 0                       # максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность)
    env = "development"                 # среда для сервера koa
    #keys = []                          # массив подписанных ключей cookie
    [api.parsing]                       # настройка парсинга (пакет: https://github.com/dlau/koa-body#readme)
        enable = false                  # активация парсинга
        encoding = "utf-8"              # кодировка парсинга
        form_limit = "56kb"             # лимит для форм
        json_limit = "1mb"              # лимит для json
        text_limit = "1mb"              # лимит для raw
        text = true                     # парсинг raw
        json = true                     # парсинг json
        multipart = false               # парсинг составных частей
        include_unparsed = false        # добавить исходное тело запроса в переменную ctx.request.body
        urlencoded = true               # парсинг данных urlencoded
        json_strict = true              # строгий режим парсинга json
        methods = ["POST"]              # список методов для парсинга

[input]                                 # настройка INPUT API
    enable = false                      # активация INPUT API
    auth = false                        # активация авторизации
    listening = "*:3002"                # настройка слушателя
    prefix = "/input"                   # префикс
    proxy = false                       # когда поле заголовка true proxy будут доверенным
    subdomain_offset = 2                # смещение от поддомена для игнорирования
    proxy_header = "X-Forwarded-For"    # заголовок IP прокси
    ips_count = 0                       # максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность)
    env = "development"                 # среда для сервера koa
    #keys = []                          # массив подписанных ключей cookie
    [input.parsing]                     # настройка парсинга (пакет: https://github.com/dlau/koa-body#readme)
        enable = false                  # активация парсинга
        encoding = "utf-8"              # кодировка парсинга
        form_limit = "56kb"             # лимит для форм
        json_limit = "1mb"              # лимит для json
        text_limit = "1mb"              # лимит для raw
        text = true                     # парсинг raw
        json = true                     # парсинг json
        multipart = false               # парсинг составных частей
        include_unparsed = false        # добавить исходное тело запроса в переменную ctx.request.body
        urlencoded = true               # парсинг данных urlencoded
        json_strict = true              # строгий режим парсинга json
        methods = ["POST"]              # список методов для парсинга
    [input.receivers]                   # настройка приёмника
        [input.receivers.telegraf_json] # настройка для telegraf_json
            enable = false              # активация telegraf_json
            table_tag = "host"          # имя тега значение которого будет использоваться как имя таблицы
        [input.receivers.triggers]      # настройка для triggers
            enable = false              # активация triggers
            db = "triggers"             # имя базы для хранения

[metrics_store]                         # настройка хранилище метрик
    ttl = 40                            # время жизни записи в секундах     
    [metrics_store.cleaning]            # настройка очистки записей
        enable = true                   # активация очистки
        time_zone = "Europe/Moscow"     # временная зона для cron
        interval = "1 1 * * * *"        # интервал cron

[store]             # настройка временного хранилища
    path = "store"  # папка хранения данных       
    ttl = 86400     # время жизни записей

[handlers]                              # настройка для обработчиков
    modules_path = "handlers_modules"   # путь к папке хранения модуля
    settings_path = "handlers_settings" # путь к папке хранения настроек задач

[web]                                   # настройка WEB сервера
    enable = false                      # активация WEB сервера
    auth = false                        # активация авторизации
    listening = "*:3000"                # настройка слушателя
    prefix = ""                         # префикс
    proxy = false                       # когда поле заголовка true proxy будут доверенным
    subdomain_offset = 2                # смещение от поддомена для игнорирования
    proxy_header = "X-Forwarded-For"    # заголовок IP прокси
    ips_count = 0                       # максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность)
    env = "development"                 # среда для сервера koa
    #keys = []                          # массив подписанных ключей cookie
    [web.static]                        # настройка статического сервера (пакет: https://github.com/koajs/static)
        folder = "static"               # папка со статическими файлами
        maxage = 0                      # время жизни кеша в миллисекундах
        hidden = false                  # разрешение отдавать скрытые файлы
        index = "index.html"            # название файла индекса
        defer = false                   # позволить активировать нижестоящие промежуточное по первым
        gzip = true                     # gzip сжатие
        brotli = true                   # автоматическое обслуживание файла brotli

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
    [[notifications.channels]]              # список выходов
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

### Таблица параметров конфигурации

| Параметр | Тип | Значение | Описание |
| ----- | ----- | ----- | ----- |
| logger.mode |строка | prod | режим отображения prod, dev или debug |
| logger.enable | логический | true | активация логгера |
| logger.timestamp | логический | false | выводить время лога (true или false) |
| logger.type | логический | true | выводить тип лога (true или false) |
| authorization.users | массив | [] | массив пользователей |
| api.enable | логический | false | активация API (true или false) |
| api.auth | логический | false | активация авторизации (true или false) |
| api.listening | строка | *:3001 | настройка слушателя, формат <хост>:<порт> |
| api.prefix | строка | /api | префикс |
| api.proxy | логический | false | когда поле заголовка true proxy будут доверенным |
| api.subdomain_offset | число | 2 | смещение от поддомена для игнорирования |
| api.proxy_header | строка | X-Forwarded-For | заголовок IP прокси |
| api.ips_count | число | 0 | максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность) |
| api.env | строка | development | среда для сервера [koa](https://www.npmjs.com/package/koa) |
| api.keys | строка[] |  | массив подписанных ключей cookie |
| api.parsing.enable | логический | false | активация парсинга (true или false) |
| api.parsing.encoding | строка | utf-8 | кодировка парсинга |
| api.parsing.form_limit | строка | 56kb | лимит для форм |
| api.parsing.json_limit | строка | 1mb | лимит для json |
| api.parsing.text_limit | строка | 1mb | лимит для raw |
| api.parsing.text | логический | true | парсинг raw |
| api.parsing.json | логический | true | парсинг json |
| api.parsing.multipart | логический | false | парсинг составных частей |
| api.parsing.include_unparsed | логический | false | добавить исходное тело запроса в переменную ctx.request.body |
| api.parsing.urlencoded | логический | true | парсинг данных urlencoded |
| api.parsing.json_strict | логический | true | строгий режим парсинга json |
| api.parsing.methods | строка[] | ["POST"] | список методов для парсинга POST, PUT и/или PATCH |
| input.enable | логический | false | активация INPUT API (true или false) |
| input.auth | логический | false | активация авторизации (true или false) |
| input.listening | строка | *:3002 | настройка слушателя, формат <хост>:<порт> |
| input.prefix | строка | /input | префикс |
| input.proxy | логический | false | когда поле заголовка true proxy будут доверенным |
| input.subdomain_offset | число | 2 | смещение от поддомена для игнорирования |
| input.proxy_header | строка | X-Forwarded-For | заголовок IP прокси |
| input.ips_count | число | 0 | максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность) |
| input.env | строка | development | среда для сервера [koa](https://www.npmjs.com/package/koa) |
| input.keys | строка[] |  | массив подписанных ключей cookie |
| input.parsing.enable | логический | false | активация парсинга (true или false) |
| input.parsing.encoding | строка | utf-8 | кодировка парсинга |
| input.parsing.form_limit | строка | 56kb | лимит для форм |
| input.parsing.json_limit | строка | 1mb | лимит для json |
| input.parsing.text_limit | строка | 1mb | лимит для raw |
| input.parsing.text | логический | true | парсинг raw |
| input.parsing.json | логический | true | парсинг json |
| input.parsing.multipart | логический | false | парсинг составных частей |
| input.parsing.include_unparsed | логический | false | добавить исходное тело запроса в переменную ctx.request.body |
| input.parsing.urlencoded | логический | true | парсинг данных urlencoded |
| input.parsing.json_strict | логический | true | строгий режим парсинга json |
| input.parsing.methods | строка[] | ["POST"] | список методов для парсинга POST, PUT и/или PATCH |
| input.receivers.telegraf_json.enable | логический | false | активация telegraf_json
| input.receivers.telegraf_json.table_tag | строка | host | имя тега значение которого будет использоваться как имя таблицы
| input.receivers.triggers.enable | логический | false | активация triggers
| input.receivers.triggers.db | строка | triggers | имя базы для хранения
| web.enable | логический | false | активация API (true или false) |
| web.auth | логический | false | активация авторизации (true или false) |
| web.listening | строка | *:3001 | настройка слушателя, формат <хост>:<порт> |
| web.prefix | строка |  | префикс |
| web.proxy | логический | false | когда поле заголовка true proxy будут доверенным |
| web.subdomain_offset | число | 2 | смещение от поддомена для игнорирования |
| web.proxy_header | строка | X-Forwarded-For | заголовок IP прокси |
| web.ips_count | число | 0 | максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность) |
| web.env | строка | development | среда для сервера [koa](https://www.npmjs.com/package/koa) |
| web.keys | строка[] |  | массив подписанных ключей cookie |
| web.static.folder | строка | static | папка со статическими файлами |
| web.static.maxage | число |  | время жизни кеша в миллисекундах |
| web.static.hidden | логический | false | разрешение отдавать скрытые файлы |
| web.static.index | строка | index.html | название файла индекса |
| web.static.defer | логический | false | позволить активировать нижестоящие промежуточное по первым |
| web.static.gzip | логический | true | gzip сжатие |
| web.static.brotli | логический | true | автоматическое обслуживание файла brotli |
| metrics_store.ttl | число | 40 | время жизни записи в секундах |
| metrics_store.cleaning.enable | логический | true | активация очистки |
| metrics_store.cleaning.time_zone | строка | Europe/Moscow | временная зона для cron |
| metrics_store.cleaning.interval | строка | 1 1 * * * * | интервал cron |
| store.path | строка | store | папка хранения данных |
| store.ttl | число | 86400 | время жизни записей |
| handlers.modules_path | строка | handlers_modules | путь к папке хранения модуля |
| handlers.settings_path | строка | handlers_settings | путь к папке хранения настроек задач |
| notifications.path | строка | channels | папка с отдельным описанием каналов |
| notifications.channels |  | [] | массив каналов [настройка каналов](CHANNELS.md) |

### Настройка через переменные среды

Ключи конфигурации можно задать через переменные среды ОС. Имя переменной среды формируется из двух частей, префикса `NOTIFICATOR_` и имени переменной в верхнем реестре. Если переменная вложена, то это обозначается символом `_`. Переменные среды имеют высший приоритет.

пример для переменной **logger.mode**: `NOTIFICATOR_LOGGER_MODE`

пример для переменной **api.ips_count**: `NOTIFICATOR_API_IPS_COUNT`
