# API

## Информация

Сервис предоставляет два интерфейса API и INPUT API, которые настраиваются в секциях файла настройки **api** и **input**. все интерфейсы доступны по протоколу HTTP.

### Примеры применения

проверить доступность сервера: `curl -i http://localhost:3001/api/healthcheck` или `curl -i http://localhost:3001/api/`  

### API информации сервиса

| URL | Метод | Код | Описание | Пример ответа/запроса |
| ----- | ----- | ----- | ----- | ----- |
| / | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck/status | GET | 200 | получить статус здоровья | [пример](#v1_status) |
| /v1/channels | GET | 200 | получить список каналов | [пример](#v1_channels) |
| /v1/handlers | GET | 200 | получить список обработчиков | [пример](#v1_handlers) |
| /v1/metrics | GET | 200 | получить список баз метрик | [пример](#v1_metrics) |
| /v1/metrics/${db} | GET | 200 | получить список таблиц  | [пример](#v1_metrics_db) |
| /v1/metrics/${db}/${table} | GET | 200 | получить список записей | [пример](#v1_metrics_db_table) |
| /v1/metrics/${db}/${table}/${record} | GET | 200 | получить запись | [пример](#v1_metrics_db_table_record) |

### INPUT API сервиса

| URL | Метод | Код | Описание | Пример ответа/запроса |
| ----- | ----- | ----- | ----- | ----- |
| / | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck/status | GET | 200 | получить статус здоровья | [пример](#v1_status) |
| /v1/telegraf/json | POST | 200 | Интерфейс для данных в формате influx json | OK |

## Примеры ответов/запросов

### Базовый ответ провала

Этот ответ возвращается при отказе выполнения запроса. Пример:

```js
{
    "status": "fail",
    "message": "Причина отказа"
}
```

### Базовый ответ ошибки

Этот ответ возвращается при ошибке на сервере. Пример:

```js
{
    "status": "error",
    "message": "Причина ошибки"
}
```

### <a name="v1_status"></a> Получить статус здоровья: /healthcheck/status

**Тело ответа**

```js
{
    "healthy": true,
    "work_time": 21,
    "human_work_time": "21s"
}
```

### <a name="v1_tasks_store"></a> Получить список данных задачи: /v1/tasks/${id_task}/store
```js
{
    "status": "success",
    "data": {
        "task_id": "empty",
        "store_keys": [
            "key1",
            "key2"
        ]
    }
}
```

### <a name="v1_channels"></a> Получить список каналов: /v1/channels

```js
{
    "status": "success",
    "data": [
        {
            "enable": false,
            "type": "telegram",
            "name": "telegram"
        }
    ]
}
```

### <a name="v1_handlers"></a> Получить список обработчиков: /v1/handlers

```js
{
    "status": "success",
    "data": [
        {
            "id": "global_query",
            "enable": false,
            "status": "success",
            "global": true,
            "staring": false,
            "executing": false,
            "description": "описание глобальной задачи",
            "time_zone": "Europe/Moscow",
            "cron_interval": "*/10 * * * * *"
        }
    ]
}
```

### <a name="v1_metrics"></a> получить список баз метрик: /v1/metrics

```js
{
    "status": "success",
    "data": [
        "cpu"
    ]
}
```

### <a name="v1_metrics_db"></a> получить список таблиц: /v1/metrics/${db}

```js
{
    "status": "success",
    "data": {
        "db": "cpu",
        "tables": [
            "desktop-825qbfa"
        ]
    }
}
```

### <a name="v1_metrics_db_table"></a> получить список записей: /v1/metrics/${db}/${table}

```js
{
    "status": "success",
    "data": {
        "db": "cpu",
        "table": "desktop-825qbfa",
        "records": [
            "cpu0",
            "cpu1",
            "cpu2",
            "cpu3",
            "cpu-total"
        ]
    }
}
```

### <a name="v1_metrics_db_table_record"></a> получить запись: /v1/metrics/${db}/${table}/${record}

```js
{
    "status": "success",
    "data": {
        "db": "cpu",
        "table": "desktop-825qbfa",
        "record": "cpu0",
        "data": {
            "fields": {
                "usage_guest": 0,
                "usage_guest_nice": 0,
                "usage_idle": 63.73134328358209,
                "usage_iowait": 0,
                "usage_irq": 4.477611940298507,
                "usage_nice": 0,
                "usage_softirq": 0,
                "usage_steal": 0,
                "usage_system": 25.37313432835821,
                "usage_user": 6.417910447761194
            },
            "name": "cpu",
            "tags": {
                "cpu": "cpu0",
                "host": "DESKTOP-825QBFA"
            },
            "timestamp": 1612445640000
        }
    }
}
```
