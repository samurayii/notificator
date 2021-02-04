# Модули и настройки

## Информация

Для обработки данных и правил рассылки необходимо написать модули и настройки задач. Модуль это обработчик написанный на javascript, модули загружаются из папки указанной в файле конфигурации ключом **handlers.modules_path**. Настройки задач это файл в формате toml, yml и json где описывается поведения обработки данных.

## Настройки задачи

Задачи могут быть глобальными и динамическими. Глобальная задача создаётся при запуске приложения и не изменяется при работе. Динамическая задача выступает в роли шаблона, из которого в процессе работы будут создаваться задачи обработки.

### Пример глобальной задачи

```toml
global = true                               # указывает тип задачи
description = "описание глобальной задачи"  # описание
notifications = ["telegram"]                # каналы оповещений
handler = "module1"                         # идентификатор модуля
enable = true                               # активация задачи
trigger_interval = "5m"                     # время колебания триггера
notification_repeat_interval = "4h"         # повтор оповещение если состояние задачи не success

[cron]                              # настройка времени выполнения cron
    time_zone = "Europe/Moscow"     # временная зона
    interval = "*/10 * * * * *"     # интервал

```

### Пример динамической задачи

```toml
global = false
description = "описание не глобальной задачи"
notifications = ["telegram"]
handler = "module2"
trigger_interval = "30s"
notification_repeat_interval = "30h"
ttl = "1m"                              # время существование задачи без данных
update = "5s"                           # интервал обновления задач

[cron]
    time_zone = "Europe/Moscow"
    interval = "*/10 * * * * *"

[query]                             # настройки запроса метрик (только для динамической задачи)
    [query.db]                      # настройка имени базы данных
        name = "cpu"                # имя базы данных (НЕ ОБЯЗАТЕЛЬНО)
        regexp = "cpu.*"            # регулярное выражение для выборки первой базы данных (НЕ ОБЯЗАТЕЛЬНО)
        regexp_all = "cpu.*"        # регулярное выражение для выборки всех баз данных (НЕ ОБЯЗАТЕЛЬНО)
    [query.table]                   # настройка имени таблицы
        name = "desktop-825qbfa"    # имя таблицы (НЕ ОБЯЗАТЕЛЬНО)
        regexp = "desktop-.*"       # регулярное выражение для выборки первой таблицы (НЕ ОБЯЗАТЕЛЬНО)
        regexp_all = "desktop-.*"   # регулярное выражение для выборки всех таблиц (НЕ ОБЯЗАТЕЛЬНО)
    [query.record]                  # настройка идентификатора записи
        name = "cpu0"               # имя записи (НЕ ОБЯЗАТЕЛЬНО)
        regexp = "cpu.*"            # регулярное выражение для выборки первой записи (НЕ ОБЯЗАТЕЛЬНО)
        regexp_all = "cpu.*"        # регулярное выражение для выборки всех запись (НЕ ОБЯЗАТЕЛЬНО)
```

## Обработчики

Модуль выполняется в собственном контексте, который имеет свои методы. Так же он имеет вспомогательные объекты.

- **metrics** - хранилище метрик.
- **db** - временное хранилище задачи.

### Таблица методов

| Название | Тип | Пример | Описание |
| ----- | ----- | ----- | ----- |
| status | свойство | this.status | текущий статус задачи |
| alert | метод | this.alert(текст ии объект) | активировать триггер **alert** и отослать сообщение |
| warning | метод | this.warning(текст ии объект) | активировать триггер **warning** и отослать сообщение |
| nodata | метод | this.nodata(текст ии объект) | активировать триггер **nodata** и отослать сообщение |
| success | метод | this.success(текст ии объект) | активировать триггер **success** и отослать сообщение |
| metrics.query | метод | this.metrics.query(db_name: string, table_name: string, record_name: string) => object | получить запись |
| metrics.queryRegExp | метод | this.metrics.queryRegExp(db_name: string, table_name: string, regexp: string) => object | получить первую запись по регулярному выражению |
| metrics.queryRegExpAll | метод | this.metrics.queryRegExpAll(db_name: string, table_name: string, regexp: string) => object[] | получить все записи по регулярному выражению |
| db.keys | метод | this.db.keys() => object | получить список записей |
| db.request | метод | this.db.request(record_name:string, store_name?: string) => unknown | получить запись |
| db.exist | метод | this.db.exist(record_name:string, store_name?: string) => boolean | проверить запись на существование |
| db.remove | метод | this.db.remove(record_name:string) => void | удалить запись |
| db.update | метод | this.db.update(record_name:string, data: unknown) => void | обновить/создать запись |

### Пример модуля для глобальной задачи

```js
module.exports = function () {
    const record = this.metrics
    if (record.fields.key1 > 100) {
        this.alert("alert message");
    }
}
```

### Пример модуля для динамической задачи

```js
module.exports = function (data) { 
    // в динамическую задачу передаётся результат выборки
    // если данных нет то будет передано undefined
    if (data === undefined) {
        this.nodata("no data message");
        return;
    }
    if (data.fields.key1 > 100) {
        this.alert("alert message");
    }
}
```
