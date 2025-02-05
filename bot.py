import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters
import json
import datetime
import aiohttp
import asyncio

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot token and config
TOKEN = "7456568956:AAFQj9mE2IbPrlIjGzmkQfy8I7jrDtnLJM8"
ADMIN_ID = 7153979965
WEBSITE_URL = "https://yourwebsite.com"

# Database simulation (replace with real database in production)
class Database:
    def __init__(self):
        self.users = {}
        self.products = []
        self.transactions = []
        self.load_data()
    
    def load_data(self):
        try:
            with open('database.json', 'r') as f:
                data = json.load(f)
                self.users = data.get('users', {})
                self.products = data.get('products', [])
                self.transactions = data.get('transactions', [])
        except FileNotFoundError:
            self.save_data()
    
    def save_data(self):
        with open('database.json', 'w') as f:
            json.dump({
                'users': self.users,
                'products': self.products,
                'transactions': self.transactions
            }, f)

    async def add_user(self, user_data):
        user_id = str(user_data['id'])
        if user_id not in self.users:
            self.users[user_id] = {
                'id': user_id,
                'username': user_data.get('username', ''),
                'first_name': user_data.get('first_name', ''),
                'balance': 0.0,
                'joined_date': datetime.datetime.now().isoformat(),
                'last_seen': datetime.datetime.now().isoformat()
            }
            self.save_data()
            return True
        return False

    async def update_balance(self, user_id, amount):
        user_id = str(user_id)
        if user_id in self.users:
            self.users[user_id]['balance'] += amount
            self.save_data()
            return True
        return False

    async def add_transaction(self, user_id, amount, type_='deposit'):
        transaction = {
            'user_id': str(user_id),
            'amount': amount,
            'type': type_,
            'date': datetime.datetime.now().isoformat()
        }
        self.transactions.append(transaction)
        self.save_data()

db = Database()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    await db.add_user({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name
    })
    
    keyboard = [
        [InlineKeyboardButton("🌐 Вернуться на сайт", url=WEBSITE_URL)]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"Добро пожаловать, {user.first_name}! Вы успешно авторизовались.\n"
        "Теперь вы можете вернуться на сайт и использовать все функции.",
        reply_markup=reply_markup
    )
    
    if ADMIN_ID:
        await context.bot.send_message(
            chat_id=ADMIN_ID,
            text=f"Новый пользователь:\nID: {user.id}\nUsername: @{user.username}"
        )

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.effective_user.id != ADMIN_ID:
        return
    
    keyboard = [
        [
            InlineKeyboardButton("👥 Пользователи", callback_data="admin_users"),
            InlineKeyboardButton("📊 Статистика", callback_data="admin_stats")
        ],
        [
            InlineKeyboardButton("➕ Добавить товар", callback_data="admin_add_product"),
            InlineKeyboardButton("❌ Удалить товар", callback_data="admin_remove_product")
        ],
        [
            InlineKeyboardButton("💰 Изменить баланс", callback_data="admin_balance"),
            InlineKeyboardButton("📝 Логи", callback_data="admin_logs")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🔐 Панель администратора:",
        reply_markup=reply_markup
    )

async def admin_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if update.effective_user.id != ADMIN_ID:
        await query.answer("Доступ запрещен")
        return
    
    await query.answer()
    
    if query.data == "admin_users":
        users_text = "👥 Список пользователей:\n\n"
        for user_id, user_data in db.users.items():
            users_text += f"ID: {user_id}\n"
            users_text += f"Username: @{user_data['username']}\n"
            users_text += f"Баланс: ${user_data['balance']:.2f}\n"
            users_text += f"Дата регистрации: {user_data['joined_date']}\n"
            users_text += f"Последняя активность: {user_data['last_seen']}\n\n"
        
        await query.message.reply_text(users_text)
    
    elif query.data == "admin_stats":
        total_users = len(db.users)
        total_balance = sum(user['balance'] for user in db.users.values())
        total_transactions = len(db.transactions)
        
        stats_text = "📊 Статистика:\n\n"
        stats_text += f"Всего пользователей: {total_users}\n"
        stats_text += f"Общий баланс: ${total_balance:.2f}\n"
        stats_text += f"Всего транзакций: {total_transactions}\n"
        
        await query.message.reply_text(stats_text)

def main() -> None:
    application = Application.builder().token(TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admin", admin_command))
    application.add_handler(CallbackQueryHandler(admin_callback))

    application.run_polling()

if __name__ == '__main__':
    main()
