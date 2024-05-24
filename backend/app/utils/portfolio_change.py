from datetime import timedelta
from app.models.models import UserProfile

def portfolio_change(user_data: UserProfile):
    for league_with_portfolio in user_data.leagues:
        portfolio_history = league_with_portfolio.portfolio_history
        if len(portfolio_history) >= 2:
            last_value = portfolio_history[-1].value
            first_value = portfolio_history[0].value

            one_day_ago_value = next((item.value for item in reversed(portfolio_history)
                                      if item.date <= portfolio_history[-1].date - timedelta(days=1)), first_value)
            one_day_change = last_value - one_day_ago_value
            league_with_portfolio.one_day_change = one_day_change

            three_days_ago_value = next((item.value for item in reversed(portfolio_history)
                                         if item.date <= portfolio_history[-1].date - timedelta(days=3)), first_value)
            three_day_change = last_value - three_days_ago_value
            league_with_portfolio.three_day_change = three_day_change
        else:
            league_with_portfolio.one_day_change = None
            league_with_portfolio.three_day_change = None
    return user_data
