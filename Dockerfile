# Backend Fretar — Laravel 12 (PHP 8.3)
FROM docker.io/library/php:8.3-cli

# Extensoes do PHP (pdo_pgsql + intl) e utilitarios (pg_isready, composer precisa de git/unzip).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        libicu-dev \
        libpq-dev \
        postgresql-client \
        unzip \
    && docker-php-ext-install -j"$(nproc)" intl pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer disponivel no container (imagem oficial com:2).
COPY --from=docker.io/library/composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# O app inteiro (vendor e gerado pelo composer dentro da imagem, nao vem do host).
COPY . .

RUN chmod +x /app/entrypoint.sh \
    && composer install --no-interaction --no-progress --prefer-dist \
    && php artisan storage:link

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]