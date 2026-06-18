import { useState } from 'react'
import './App.css'

function App() {
  // --- ユーザー登録用の状態 ---
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userMessage, setUserMessage] = useState('')

  // ---  支出登録用の状態 ---
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [isShared, setIsShared] = useState(false) // ★ここに追記！
  const [expenseMessage, setExpenseMessage] = useState('')
  const [settlement, setSettlement] = useState({ totalAmount: 0, perPerson: 0 });

  //  ユーザー登録ボタンが押された時の処理
  const handleRegister = async (e) => {
    e.preventDefault()
    const userData = { name, email, password }
    try {
      //  本来のユーザー登録用のURLに
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      const data = await response.json()
      if (response.ok) {
        setUserMessage(`登録大成功！ ユーザーID: ${data.userId}`)
        setName(''); setEmail(''); setPassword('')
      } else {
        setUserMessage(`登録失敗: ${data.error}`)
      }
    } catch (error) {
      setUserMessage('サーバーと通信できませんでした。')
    }
  }

//  支出登録ボタンが押された時の処理
  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    const expenseData = { date, category, amount: Number(amount), isShared }

    try {
      const response = await fetch('http://localhost:8080/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      })
      const data = await response.json()

      if (response.ok) {
        setExpenseMessage(`【登録成功】家計簿に記録しました！`)
        setDate(''); setCategory(''); setAmount(''); setIsShared(false)
      } else {
        setExpenseMessage(`【登録失敗】: ${data.error}`)
      }
    } catch (error) {
      setExpenseMessage('サーバーと通信できませんでした。')
    }
  }

  const fetchSettlement = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/accounts/summary/settlement');
      const data = await response.json();
      console.log("取得したデータ:", data); // ★追加！これでデータを確認
      setSettlement(data);
    } catch (error) {
      console.error('エラー詳細:', error);
    }
  };

  return (
      <div className="app-layout">
        {/*  左側：ユーザー登録エリア */}
        <div className="register-container">
          <h2>ユーザー登録</h2>
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>お名前:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>メールアドレス:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>パスワード:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="register-button">アカウント登録</button>
          </form>
          {userMessage && <p className="result-message">{userMessage}</p>}
        </div>
        {/*  右側：支出入力と精算ボード */}
        <div className="register-container expense-container">

          <h2>支出登録フォーム</h2>
          <div className="expense-form-wrapper">
            <form onSubmit={handleExpenseSubmit}>
              <div className="input-group">
                <label>日付:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>カテゴリー:</label>
                <input type="text" value={category} placeholder="食費" onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>金額:</label>
                <input type="number" value={amount} placeholder="1000" onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
                <label>折半にする:</label>
                <input
                    type="checkbox"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                />
              </div>
              <button type="submit" className="expense-button">
                支出を記録する
              </button>
            </form>
          </div>
          {/* 精算ボードエリア */}
          <div className="settlement-container" style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <h3>💰 精算ボード</h3>
            <button onClick={fetchSettlement} className="register-button">精算結果を更新</button>

            <div style={{ marginTop: '15px' }}>
              <p>折半対象の総額: {settlement.totalAmount} 円</p>
              <p>一人当たりの負担額: <strong>{settlement.perPerson} 円</strong></p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>詳細一覧</h4>

              {settlement.sharedExpenses && settlement.sharedExpenses.length > 0 ? (

                  <ul>
                    {settlement.sharedExpenses && settlement.sharedExpenses.map((item, index) => (
                        <li key={index}>
                          {item.date} / {item.category} / {item.amount}円
                        </li>
                    ))}
                  </ul>
              ) : (
                  <p>現在、折半対象の支出はありません。</p>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

export default App