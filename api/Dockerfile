FROM golang:1.27.4-alpine AS builder

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/server \
    ./cmd/server

FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S clinic \
    && adduser -S -D -H -G clinic clinic

ENV TZ=Asia/Bangkok
WORKDIR /app
COPY --from=builder /out/server ./server

USER clinic
EXPOSE 8080
ENTRYPOINT ["./server"]
