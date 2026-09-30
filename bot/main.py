import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger(__name__)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    await message.answer(
        f"🧘 Привет, {message.from_user.full_name}!\n\n"
        "Я цифровой AI-аватар для практик осознанности и медитаций.\n"
        "Платформа MindAvatar инициализирована (Этап 1: Инфраструктура)."
    )

async def main() -> None:
    if not TOKEN or TOKEN == "your_telegram_bot_father_token_here":
        logger.warning("TELEGRAM_BOT_TOKEN is not set or placeholder. Waiting for token in .env...")
        # Graceful idle loop to prevent container restart crash
        while True:
            await asyncio.sleep(60)
            
    bot = Bot(token=TOKEN)
    logger.info("Starting Telegram Bot Polling (aiogram 3.x)...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped.")
