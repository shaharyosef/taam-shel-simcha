import { Link } from "react-router-dom";
import savtaIcon from "../assets/savtaicon.png";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-100 min-h-screen text-center text-gray-800">
      {/* Hero */}
      <section className="py-16 px-4 flex flex-col items-center justify-center">
        <img
          src={savtaIcon}
          alt="סבתא שמחה"
          className="w-36 h-36 md:w-44 md:h-44 rounded-full shadow-lg mb-6 border-4 border-orange-300 object-cover"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-orange-800 mb-4">טעם של שמחה</h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-10 leading-relaxed">
          כי כל מתכון הוא גם זיכרון. זהו בית שבו כל אחד ואחת יכולים לשתף טעמים, רעיונות וסיפורים – וליצור קהילה של בישול מהלב
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register" className="bg-orange-600 text-white px-6 py-3 rounded-xl shadow hover:bg-orange-700">
            התחבר / הירשם
          </Link>
          <Link to="/public" className="bg-white border border-orange-600 text-orange-600 px-6 py-3 rounded-xl hover:bg-orange-100">
            עיין במתכונים ציבוריים
          </Link>
          <Link to="/ai-recipe" className="bg-orange-400 text-white px-6 py-3 rounded-xl shadow hover:bg-orange-500">
            🧠 AI צור מתכון עם 
          </Link>
        </div>
      </section>

      {/* סיפור השם */}
      <section className="bg-orange-100 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-800 mb-6">💛 ?מאיפה בא השם</h2>
          <p className="text-lg leading-relaxed">
            הפרויקט מוקדש לסבתא שלי, שמחה ז״ל. היא לא רק בישלה – היא חיבקה באוכל שלה.  
            כל מתכון היה כמו מכתב של אהבה.  
            "טעם של שמחה" הוא לא רק אתר מתכונים – הוא דרך לשמר זיכרונות, להחיות רגעים, ולהעביר אהבה בצלחת.
          </p>
        </div>
      </section>

      {/* מה תמצאו כאן */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-800 mb-12">🍽️ ?מה תמצאו כאן</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-orange-50 rounded-xl shadow p-6 border-t-4 border-orange-300">
              <h3 className="text-xl font-semibold mb-2">🧠  AI יצירת מתכון עם </h3>
              <p>הזן רכיבים – קבל מתכון חדש מהלב ומהמוח של הבינה המלאכותית</p>
            </div>
            <div className="bg-orange-50 rounded-xl shadow p-6 border-t-4 border-orange-300">
              <h3 className="text-xl font-semibold mb-2">📚 מאגר מתכונים ציבוריים</h3>
              <p>עיין, חפש, דרג ושתף מתכונים מהקהילה</p>
            </div>
            <div className="bg-orange-50 rounded-xl shadow p-6 border-t-4 border-orange-300">
              <h3 className="text-xl font-semibold mb-2">👩‍🍳 שתף את המתכון שלך</h3>
              <p>העלה מתכון אישי עם תמונה, הוראות, מרכיבים – ושתף את הסיפור שמאחוריו</p>
            </div>
          </div>
        </div>
      </section>

      {/* קריאה לפעולה */}
      <section className="bg-orange-600 text-white py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">🍲 הצטרפו למסע הטעמים של שמחה</h2>
          <p className="mb-6 text-lg">התחילו לשתף, לגלות ולהתאהב בבישול מהלב</p>
          <Link to="/register" className="bg-white text-orange-700 px-6 py-3 rounded-xl shadow hover:bg-orange-100">
            התחילו עכשיו
          </Link>
        </div>
      </section>
    </div>
  );
}
