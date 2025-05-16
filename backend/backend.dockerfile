FROM python:3.13-alpine

WORKDIR /app

RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    gdk-pixbuf-dev \
    libffi-dev \
    libxml2-dev \
    libxslt-dev \
    jpeg-dev \
    zlib-dev \
    musl-dev \
    py3-pip \
    ttf-dejavu  # ✅ גופנים שנדרשים ל־WeasyPrint

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
