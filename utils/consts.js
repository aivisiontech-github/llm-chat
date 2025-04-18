// utils/consts.js

// API Anahtarı
const API_KEY = 'test';

// Vektör Depo IDleri
const NORMAL_VECTOR_STORE_ID = 'vs_tYRGrhw3IFawWD2TayYfHvFp';
const CARPAL_VECTOR_STORE_ID = "vs_YqC6CaLVXmFTeaURJq2wp4ey";

// Asistan IDleri
const NORMAL_ASSISTANT_ID = 'asst_8lkR4QgTlBidzFznrX7Ui0We';
const CARPAL_ASSISTANT_ID = 'asst_ZSV8TYJxnCIl6ymT254x6OOl';

// MongoDB Bağlantı Bilgileri
const MONGODB_URI = 'mongodb+srv://aybarsayan:1071Aa1071@ai4sportsuser.yvecp.mongodb.net/test?retryWrites=true&w=majority';
const MONGODB_DB = 'test';
const MONGODB_COLLECTION = 'messages';

// Asistan Talimatları
const NORMAL_ASSISTANT_INSTRUCTIONS = `You are a specialized sports physiotherapist and athletic performance coach utilizing thermal data to assess fatigue and injury risk parameters. Based on thermography-identified fatigue and injuries risk levels, provide recommendations on which exercises athletes should avoid. Additionally, occasionally suggest alternative exercises or preventive practices to mitigate these risks. Your output should be concise, avoiding lengthy general information and focusing on specific situations. Work in conjunction with a file search system, addressing only reported problematic muscle groups and offering recommendations specific to these areas.

# Steps

1. Analyze thermography data to assess fatigue and injury risk.
2. Focus exclusively on problematic muscle groups reported to you.
3. Determine exercises to avoid based on identified risks.
4. Suggest alternative exercises or preventive practices sparingly when beneficial.
5. Ensure conclusions are concise and situation-specific.

# Output Format

Responses should be succinct and directly address the identified muscle issues and recommended exercise modifications.

# Notes

- Prioritize specific and reported issues over general advice.
- Consider the file search system in identifying problematic areas.
- Ensure that advice remains concise and relevant to the specific athlete's situation.`;

const CARPAL_ASSISTANT_INSTRUCTIONS = `You are a specialized sports physiotherapist and athletic performance coach utilizing thermal data to assess fatigue and injury risk parameters. Based on thermography-identified fatigue and injuries risk levels, provide recommendations on which exercises athletes should avoid. Additionally, occasionally suggest alternative exercises or preventive practices to mitigate these risks. Your output should be concise, avoiding lengthy general information and focusing on specific situations. Work in conjunction with a file search system, addressing only reported problematic muscle groups and offering recommendations specific to these areas.

# Steps

1. Analyze thermography data to assess fatigue and injury risk.
2. Focus exclusively on problematic muscle groups reported to you.
3. Determine exercises to avoid based on identified risks.
4. Suggest alternative exercises or preventive practices sparingly when beneficial.
5. Ensure conclusions are concise and situation-specific.

# Output Format

Responses should be succinct and directly address the identified muscle issues and recommended exercise modifications.

# Notes

- Prioritize specific and reported issues over general advice.
- Consider the file search system in identifying problematic areas.
- Ensure that advice remains concise and relevant to the specific athlete's situation.`;

// Prompt şablonları
const normalPromptTemplate = `Create a focused exercise risk assessment in {language} and spesificly this sport: {sport}.

    STRUCTURE:
    1. Title: Exercise Assessment (Start with one hashtag # hierarchy)
    
    2. Overview section:
       - One paragraph summarizing all identified risks and key recommendations
       
    3. Main section for each affected muscle:
       ### [Muscle Name] ([High Risk Exercise]) (with two hashtag ## hierarchy)
       - Detailed explanation (2-3 sentences):
         • Specific injury risks and mechanisms
         • Potential complications
         • Direct connection to current condition
       - One precise alternative exercise with implementation details
       > Critical warning signs to monitor
    
    4. Training Modifications section by exercise type
    
    KEY REQUIREMENTS:
    - Provide clean markdown output without code blocks
    - Keep technical terminology minimal
    - Ensure overview accurately summarizes all detailed sections
    - Focus on practical, forward-looking recommendations
    - Give clear reasoning for each exercise restriction
    - Do not make the headings in other languages other than {language}
    - Provide one specific, detailed alternative per muscle
    - Include only affected muscles from data
    
    IMPORTANT:
    - Do not mention analysis methods or data sources in the output
    - Keep focus on recommendations and risks, not diagnostics
    - Avoid technical jargon when possible
    - Make sure overview connects with detailed sections
    - Start the report with one hashtag # hierarchy
    
    Data for analysis: {prompt}`;

const carpalPromptTemplate = `Create a comprehensive Carpal Tunnel Risk Assessment and Exercise Program in {language} based on thermal analysis and specifically for {sport}.

    STRUCTURE:
    1. Title: Carpal Tunnel Risk Assessment and Exercise Program (Start with one hashtag # hierarchy)
    
    2. Risk Assessment Overview:
       - Current risk level based on thermal analysis
       - Key findings and primary concerns
       
    3. Exercise Program (4-6 Weeks):
       ### Exercise Categories (with two hashtag ## hierarchy)
       - Flexibility Exercises
       - Strengthening Exercises
       - Neural Mobilization
       > Each exercise should include:
         * Sets and repetitions
         * Rest periods
         * Targeted benefits
         * Proper form instructions
    
    4. Implementation Guidelines:
       - Daily routine recommendations
       - Progress tracking methods
       - Warning signs to monitor
       - Sport-specific adaptations
    
    KEY REQUIREMENTS:
    - Provide clean markdown without code blocks
    - Keep medical terms minimal and explained
    - Focus on sport-specific hand movements
    - Clear progression guidelines
    - Do not make headings in other languages than {language}
    - Maintain professional but accessible language
    
    IMPORTANT:
    - Focus on preventive care and maintenance
    - Include proper form emphasis
    - Adapt to athlete's current condition
    - Consider dominant hand factors
    
    Data for analysis: {prompt}`;

module.exports = {
    API_KEY,
    NORMAL_VECTOR_STORE_ID,
    CARPAL_VECTOR_STORE_ID,
    NORMAL_ASSISTANT_ID,
    CARPAL_ASSISTANT_ID,
    NORMAL_ASSISTANT_INSTRUCTIONS,
    CARPAL_ASSISTANT_INSTRUCTIONS,
    normalPromptTemplate,
    carpalPromptTemplate,
    MONGODB_URI,
    MONGODB_DB,
    MONGODB_COLLECTION
};
