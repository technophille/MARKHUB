import datetime

# --- 1. MOCK DATABASE ---
users_db = [
    {
        "user_id": "usr_alex_01",
        "name": "Alex",
        "target_role": "AI Engineer",
        "current_skill": "PyTorch Tensors",
        "weekly_capacity_hrs": 15,
        "last_active_at": datetime.datetime.now() - datetime.timedelta(days=8), # 8 Days Inactive!
        "streak": 4,
        "hours_logged_this_week": 0
    },
    {
        "user_id": "usr_sam_02",
        "name": "Sam",
        "target_role": "Cloud Architect",
        "current_skill": "AWS EKS Deployment",
        "weekly_capacity_hrs": 10,
        "last_active_at": datetime.datetime.now() - datetime.timedelta(hours=2), # Active Today
        "streak": 14,
        "hours_logged_this_week": 18 # Over-indexing! Velocity > 1.5
    }
]

# --- 2. THE AI MENTOR ENGINE (Simulation) ---
def run_daily_telemetry_sweep(users):
    print("\n[CRON JOB: MARKHUB INTELLIGENCE SWEEPER INITIATED]")
    now = datetime.datetime.now()
    
    for user in users:
        print(f"\nScanning Profile: {user['name']} [{user['user_id']}]")
        days_inactive = (now - user["last_active_at"]).days
        
        # Calculate Velocity (Actual Logged / Capacity)
        velocity = user["hours_logged_this_week"] / user["weekly_capacity_hrs"]
        
        print(f"  - Inactive: {days_inactive} days | Velocity: {velocity:.2f} | Streak: {user['streak']}")
        
        # 1. Check for Churn Risk (Inactive > 7 Days)
        if days_inactive >= 7:
            print(f"  --> [TRIGGER: CHURN_RISK] Initiating P7-A Resurrection Protocol.")
            resurrection_nudge = generate_resurrection_nudge(user)
            print(f"  --> [DISPATCH: EMAIL/SMS] \"{resurrection_nudge}\"")
            continue # Prioritize resurrection over velocity tweaks
            
        # 2. Check for Velocity Burnout (Velocity > 1.5)
        if velocity > 1.5:
            print(f"  --> [TRIGGER: VELOCITY_TOO_HIGH] Initiating P7-B Adaptation Protocol.")
            adaptation_nudge = generate_adaptation_nudge(user, "slowing down to prevent burnout")
            print(f"  --> [DISPATCH: DASHBOARD TOAST] \"{adaptation_nudge}\"")
        
        # 3. Check for Streak Milestones (Streak % 7 == 0)
        elif user["streak"] > 0 and user["streak"] % 7 == 0:
            print(f"  --> [TRIGGER: STREAK_MILESTONE] Initiating P7-C Milestone Protocol.")
            celebration_nudge = generate_celebration_nudge(user)
            print(f"  --> [DISPATCH: UI CONFETTI] \"{celebration_nudge}\"")

# --- 3. HARDCODED LLM MOCKS (Normally calls OpenAI/LangChain via P7 prompts) ---
def generate_resurrection_nudge(user):
    return (f"Hey {user['name']}. Looks like {user['current_skill']} paused your momentum. "
            f"Top bracket {user['target_role']}s push through this exact filter. "
            f"I found a 5-minute visual explainer on it. Take exactly 5 mins today to watch it, and let's get your {user['streak']}-day streak back.")

def generate_adaptation_nudge(user, reason):
    return (f"{user['name']}, you've logged {user['hours_logged_this_week']} hours on your {user['target_role']} track this week against a {user['weekly_capacity_hrs']} hr goal. "
            f"Incredible pace, but let's watch out for burnout. I've re-calculated your roadmap—we're now tracking 3 weeks ahead of schedule!")
            
def generate_celebration_nudge(user):
    return f"A full {user['streak']}-day streak, {user['name']}! Consistency like this is the #1 predictor of successfully transitioning into a {user['target_role']} role."

# --- 4. EXECUTION ---
if __name__ == "__main__":
    run_daily_telemetry_sweep(users_db)
    print("\n[CRON JOB COMPLETE]\n")
