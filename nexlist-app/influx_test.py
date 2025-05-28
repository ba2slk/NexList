from fastapi import FastAPI
from influxdb import InfluxDBClient
from datetime import datetime

app = FastAPI()

client = InfluxDBClient(host="influxdb", port=8086)  # 도커 네트워크 이름 사용
client.switch_database("testdb")

@app.get("/write-metric")
def write_metric():
    json_body = [
        {
            "measurement": "todo_test",
            "tags": {
                "user": "test_user"
            },
            "time": datetime.utcnow().isoformat(),
            "fields": {
                "value": 1
            }
        }
    ]
    client.write_points(json_body)
    return {"status": "metric written"}