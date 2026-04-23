# Stage 1: Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o todo-api .

# Stage 2: Final minimal image
FROM alpine:3.19

# Install CA certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/todo-api .

EXPOSE 9090

ENTRYPOINT ["/app/todo-api"]
