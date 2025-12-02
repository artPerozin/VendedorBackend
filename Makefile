.PHONY: help build up down restart logs clean train

GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

build: ## Constrói as imagens Docker
	@echo "$(GREEN)🔨 Construindo imagens Docker...$(NC)"
	docker-compose build --no-cache

up: ## Inicia todos os serviços
	@echo "$(GREEN)🚀 Iniciando serviços...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Serviços iniciados!$(NC)"
	@echo "$(YELLOW)📊 Use 'make logs' para ver os logs$(NC)"

down: ## Para todos os serviços
	@echo "$(GREEN)🛑 Parando serviços...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Serviços parados!$(NC)"

restart: ## Reinicia todos os serviços
	@echo "$(GREEN)🔄 Reiniciando serviços...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Serviços reiniciados!$(NC)"

logs: ## Exibe logs de todos os serviços
	docker-compose logs -f

logs-api: ## Exibe logs apenas da API
	docker-compose logs -f api

logs-scheduler: ## Exibe logs apenas do Scheduler
	docker-compose logs -f scheduler

logs-db: ## Exibe logs apenas do banco de dados
	docker-compose logs -f postgres

ps: ## Lista serviços em execução
	docker-compose ps

clean: ## Remove containers, volumes e imagens (⚠️ CUIDADO!)
	@echo "$(YELLOW)⚠️  Isso irá remover TODOS os dados do banco!$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)🧹 Limpando containers, volumes e imagens...$(NC)"; \
		docker-compose down -v --rmi all; \
		echo "$(GREEN)✅ Limpeza concluída!$(NC)"; \
	else \
		echo "$(YELLOW)❌ Operação cancelada$(NC)"; \
	fi

clean-volumes: ## Remove apenas os volumes (⚠️ apaga dados do banco)
	@echo "$(YELLOW)⚠️  Isso irá remover TODOS os dados do banco!$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)🗑️  Removendo volumes...$(NC)"; \
		docker-compose down -v; \
		echo "$(GREEN)✅ Volumes removidos!$(NC)"; \
	else \
		echo "$(YELLOW)❌ Operação cancelada$(NC)"; \
	fi

rebuild: ## Reconstrói e reinicia todos os serviços
	@echo "$(GREEN)🔨 Reconstruindo tudo...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✅ Reconstrução concluída!$(NC)"

train: ## Executa o script de treinamento da IA (dentro do container da API)
	@echo "$(GREEN)🤖 Iniciando treinamento da IA...$(NC)"
	docker-compose exec api node dist/scripts/trainBotOptimized.js
	@echo "$(GREEN)✅ Treinamento concluído!$(NC)"

shell-api: ## Abre shell no container da API
	docker-compose exec api sh

shell-scheduler: ## Abre shell no container do Scheduler
	docker-compose exec scheduler sh

shell-db: ## Abre psql no banco de dados
	docker-compose exec postgres psql -U $(shell grep DB_USERNAME .env | cut -d '=' -f2) -d $(shell grep DB_DATABASE .env | cut -d '=' -f2)

health: ## Verifica saúde dos containers
	@echo "$(GREEN)🏥 Verificando saúde dos containers...$(NC)"
	@docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

stats: ## Mostra estatísticas de uso de recursos
	docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

backup-db: ## Faz backup do banco de dados
	@echo "$(GREEN)💾 Fazendo backup do banco...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U $(shell grep DB_USERNAME .env | cut -d '=' -f2) $(shell grep DB_DATABASE .env | cut -d '=' -f2) > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup criado em: backups/backup_$(shell date +%Y%m%d_%H%M%S).sql$(NC)"

restore-db: ## Restaura backup do banco (use: make restore-db FILE=backups/backup_xxx.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(YELLOW)❌ Use: make restore-db FILE=backups/seu_backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📥 Restaurando backup: $(FILE)$(NC)"
	@docker-compose exec -T postgres psql -U $(shell grep DB_USERNAME .env | cut -d '=' -f2) $(shell grep DB_DATABASE .env | cut -d '=' -f2) < $(FILE)
	@echo "$(GREEN)✅ Backup restaurado!$(NC)"

update-env: ## Atualiza variáveis de ambiente e reinicia serviços
	@echo "$(GREEN)🔄 Atualizando configurações...$(NC)"
	docker-compose up -d --force-recreate
	@echo "$(GREEN)✅ Configurações atualizadas!$(NC)"