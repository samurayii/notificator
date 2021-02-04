# Настройка приёмников

## Описание

В роли приёмника сейчас используется только сборщик telegraf. Ему необходимо корректно настроить выход, который будет отправлять запросы в [API](API.md) по протоколу HTTP или HTTPS.

**Пример настройки для telegraf:**

```toml
[agent]
    interval = "10s"
    round_interval = true
    metric_batch_size = 1000
    metric_buffer_limit = 100000
    collection_jitter = "0s"
    flush_interval = "10s"
    flush_jitter = "5s"
    precision = ""
    debug = false
    quiet = false
    logfile = ""
    omit_hostname = false
 
[[inputs.http]]
    urls = ["http://localhost:3001/metrics"]
    method = "GET"
    timeout = "5s"
    data_format = "json"
    username = "telegraf"
    password = "12345678"
    json_name_key = "name"
    json_time_key = "timestamp"
    json_time_format = "unix_ms"
    tagexclude = ["url"]
     
[[outputs.http]]                                            # настройка выхода Http
    url = "http://localhost:3002/inputs/v1/telegraf/json"   # ссылка
    method = "POST"                                         # метод
    username = "telegraf"                                   # пользователь
    password = "12345678"                                   # пароль
    data_format = "json"                                    # формат данных (должен быть json)
    [outputs.http.headers]                                  # настройка заголовков
        Content-Type = "application/json"                   # заголовок (указывать обязательно)
```
