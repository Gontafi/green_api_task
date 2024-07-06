FROM golang:1.19-alpine3.18 AS builder
WORKDIR /src
COPY . .
RUN go build -v -ldflags="-w -s" -o server main.go

FROM golang:1.19-alpine3.18
WORKDIR /app
RUN apk add --no-cache tzdata && \
   apk --no-cache add curl && \
   apk add busybox && \
   addgroup -g 1000 -S appgroup && \
   adduser -u 1000 -S appuser -G appgroup
ENV TZ=Asia/Almaty
COPY --from=builder /src/server .
COPY --from=builder /src/.env.example .
COPY --from=builder /src/.env .
COPY --from=builder /src/views ./views

RUN chmod +x /app/server && chown -R appuser:appgroup /app

USER appuser:appgroup
