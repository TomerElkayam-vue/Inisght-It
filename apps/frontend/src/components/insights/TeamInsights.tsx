import React from 'react';

interface Recommendation {
  text: string;
  highlights: string[];
}

const recommendations: Recommendation[] = [
  {
    text: 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית גולר מונפרר סורברט לורם שבצק יהול, לגבעט ולוריה וושיבעט ליבם סולגק. בראיט ולחת צורק מונחף, בגורמי ממעט.',
    highlights: ['לגבעט', 'וושיבעט', 'בראיט', 'צורק מונחף', 'בגורמי ממעט']
  },
  {
    text: 'תצטריך וסתעד לבן חשים השמה - לתני מורגם בורק? לתני ישבעס.',
    highlights: ['תצטריך וסתעד לבן חשים', 'לתני ישבעס']
  },
  {
    text: 'הועניב היושבב שערש שמחויט - שלושע ולחברו חשלו שעותלשך ואחזילשך וזוהשמ זותה מנק הבקיץ אפצח דלאמת יבש, כאנה ניצאחו נתרי שהכים תוק, חדש שנרא התידם הכייר וק.',
    highlights: ['זותה', 'שעותלשך', 'התידם']
  }
];

const HighlightedText: React.FC<{ text: string; highlights: string[] }> = ({ text, highlights }) => {
  let result = text;
  highlights.forEach(highlight => {
    result = result.replace(
      highlight,
      `<span class="text-purple-400 underline">${highlight}</span>`
    );
  });

  return (
    <p 
      className="text-white mb-4 leading-relaxed text-right" 
      dangerouslySetInnerHTML={{ __html: result }}
    />
  );
};

export const TeamInsights = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6 text-right">תובנות צוותיות</h1>
      
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 text-right">המלצות למנהל</h2>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <HighlightedText 
              key={index} 
              text={rec.text} 
              highlights={rec.highlights} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 