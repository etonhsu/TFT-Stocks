from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.endpoints import player, leaderboard, login, register, user, search, transaction, dashboard, \
    transaction_history, top_leaderboard, favorites, favorites_toggle, change_user_info, league_overview, league_create, \
    league_join, league_update, league_search, league_dropdown, league_edit, league_current

app = FastAPI(title='TFT Stocks API', version='1.0', description='API for a TFT stock market simulation')

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,  # type: ignore
    allow_origins=[
        "http://localhost:5173",
        "https://tftstocks.com",
        "https://tftstocks-dsc3fryjtq-uc.a.run.app",
        "https://tftstocksite.netlify.app",
        "https://www.tftstocks.com",
        "https://main--tftstocksite.netlify.app",
        "http://localhost:4173",
        "http://ec2-54-187-157-154.us-west-2.compute.amazonaws.com:8000/"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allowing all methods
    allow_headers=["*"],  # Allowing all headers
)

# Include routers
app.include_router(user.router)
app.include_router(player.router)
app.include_router(transaction.router)
app.include_router(leaderboard.router)
app.include_router(dashboard.router)
app.include_router(login.router)
app.include_router(search.router)
app.include_router(register.router)
app.include_router(transaction_history.router)
# app.include_router(refresh_dashboard.router)
app.include_router(top_leaderboard.router)
app.include_router(favorites.router)
app.include_router(favorites_toggle.router)
app.include_router(change_user_info.router)
app.include_router(league_overview.router)
app.include_router(league_create.router)
app.include_router(league_join.router)
app.include_router(league_update.router)
app.include_router(league_search.router)
app.include_router(league_dropdown.router)
app.include_router(league_edit.router)
app.include_router(league_current.router)



# Optional: Add any global middleware, event handlers, or exception handlers
@app.on_event('startup')
async def startup_event():
    print('Starting up...')


@app.on_event('shutdown')
async def shutdown_event():
    print('Shutting down...')


# Run the app with Uvicorn if this file is executed directly
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
