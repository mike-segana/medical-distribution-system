#python image as a base
FROM python:3.10.8-slim

#working directory in the container
WORKDIR /app

#copying the current directory contents into the container at /app
COPY . /app

#installing requirements
RUN pip install --no-cache-dir -r requirements.txt

#exposing port
EXPOSE 8001

#to run app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
