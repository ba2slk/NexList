# Python 3.9 베이스 이미지 사용
FROM python:3.12.3-slim

# 작업 디렉토리 설정
WORKDIR /app

# 컨테이너 포트
EXPOSE 5001

# Docker 파일의 위치(빌드 컨텍스트)에서 WORKDIR로 복사 (.dockerignore 항목 제외)
COPY . .

# 의존성 설치
# 컨테이너 배포 환경에서는 --no-cache-dir로 컨테이너 크기를 작게 하는 게 좋음.
RUN pip install --no-cache-dir -r requirements.txt

# FastAPI 서버 실행: CMD는 도커 파일에서 한 번만 사용할 수 있음.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "5001"]

# 현재 환경 변수는 .env를 사용하므로 docker-compose.yml에서 제어