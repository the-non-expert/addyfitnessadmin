/**
 * Service Categories Data
 * Static category definitions for Training, Healthcare, and Nutrition services
 */

/**
 * Training service categories (4 total)
 * All categories are UI-only navigation - clicking any category shows ALL assigned clients
 */
export const trainingCategories = [
    {
        id: 'live-workout',
        name: 'Live Workout Session',
        slug: 'live-workout-session',
        description: 'Real-time guided workout sessions',
        icon: 'Dumbbell',
        available: true
    },
    {
        id: 'yoga',
        name: 'Yoga',
        slug: 'yoga',
        description: 'Mind-body wellness through yoga practice',
        icon: 'Heart',
        available: true
    },
    {
        id: 'hiit-liit',
        name: 'HIIT & LIIT',
        slug: 'hiit-and-liit',
        description: 'High and Low Intensity Interval Training',
        icon: 'Zap',
        available: true
    },
    {
        id: 'senior-workout',
        name: 'Senior Workout',
        slug: 'senior-workout',
        description: 'Gentle fitness programs for seniors',
        icon: 'Users',
        available: true
    }
];

/**
 * Healthcare service specializations (6 total)
 * All specialties are UI-only navigation - clicking any specialty shows ALL assigned patients
 */
export const healthcareSpecialties = [
    {
        id: 'general-physician',
        name: 'General Physician',
        slug: 'general-physician',
        description: 'General medical consultation and care',
        icon: 'Stethoscope',
        available: true
    },
    {
        id: 'gynaecologist',
        name: 'Gynaecologist',
        slug: 'gynaecologist',
        description: 'Women\'s health and reproductive care',
        icon: 'User',
        available: true
    },
    {
        id: 'endocrinologist',
        name: 'Endocrinologist',
        slug: 'endocrinologist',
        description: 'Hormone and metabolic disorders',
        icon: 'Activity',
        available: true
    },
    {
        id: 'mental-health',
        name: 'Mental Health',
        slug: 'mental-health',
        description: 'Psychological wellness and counseling',
        icon: 'Brain',
        available: true
    },
    {
        id: 'general-surgeon',
        name: 'General Surgeon',
        slug: 'general-surgeon',
        description: 'Surgical procedures and consultations',
        icon: 'Scissors',
        available: true
    },
    {
        id: 'dermatologist',
        name: 'Dermatologist',
        slug: 'dermatologist',
        description: 'Skin health and treatment',
        icon: 'Sparkles',
        available: true
    }
];

/**
 * Nutrition service plans (12 total)
 * Currently all marked as unavailable (future feature)
 */
export const nutritionPlans = [
    {
        id: 'weight-loss',
        name: 'Weight Loss',
        slug: 'weight-loss',
        description: 'Personalized nutrition for weight reduction',
        icon: 'TrendingDown',
        available: false
    },
    {
        id: 'weight-gain',
        name: 'Weight Gain',
        slug: 'weight-gain',
        description: 'Healthy weight gain nutrition plans',
        icon: 'TrendingUp',
        available: false
    },
    {
        id: 'diabetes',
        name: 'Diabetes Management',
        slug: 'diabetes',
        description: 'Diabetic-friendly meal planning',
        icon: 'Activity',
        available: false
    },
    {
        id: 'thyroid',
        name: 'Thyroid Care',
        slug: 'thyroid',
        description: 'Nutrition for thyroid health',
        icon: 'Circle',
        available: false
    },
    {
        id: 'pcos',
        name: 'PCOS',
        slug: 'pcos',
        description: 'PCOS-specific dietary guidance',
        icon: 'Users',
        available: false
    },
    {
        id: 'heart-health',
        name: 'Heart Health',
        slug: 'heart-health',
        description: 'Cardiovascular wellness nutrition',
        icon: 'Heart',
        available: false
    },
    {
        id: 'sports-nutrition',
        name: 'Sports Nutrition',
        slug: 'sports-nutrition',
        description: 'Performance-focused meal plans',
        icon: 'Trophy',
        available: false
    },
    {
        id: 'prenatal',
        name: 'Prenatal Nutrition',
        slug: 'prenatal',
        description: 'Pregnancy nutrition guidance',
        icon: 'Baby',
        available: false
    },
    {
        id: 'postnatal',
        name: 'Postnatal Nutrition',
        slug: 'postnatal',
        description: 'Postpartum recovery nutrition',
        icon: 'Smile',
        available: false
    },
    {
        id: 'gut-health',
        name: 'Gut Health',
        slug: 'gut-health',
        description: 'Digestive wellness nutrition',
        icon: 'Package',
        available: false
    },
    {
        id: 'vegan',
        name: 'Vegan Nutrition',
        slug: 'vegan',
        description: 'Plant-based meal planning',
        icon: 'Leaf',
        available: false
    },
    {
        id: 'senior-nutrition',
        name: 'Senior Nutrition',
        slug: 'senior-nutrition',
        description: 'Age-appropriate dietary plans',
        icon: 'Users',
        available: false
    }
];
