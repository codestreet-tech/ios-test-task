<img width="803" height="374" alt="cover" src="https://github.com/user-attachments/assets/42b71012-3ba2-41a5-aad5-b2a6a244b8b1" />

Загальні вимоги

UI: SwiftUI [Посилання на дизайн](https://www.figma.com/design/RBK1grYLtP9EQEUMRxUu9z/Code-Street?node-id=0-1&t=JoGJiYnO2ZtEoSP3-1)

Архітектура: MVVM + Coordinator (рекомендовано Stinsen, але можна власну реалізацію)
	
	•	Логіка сигналінгу: Socket.IO
	•	WebRTC:
	•	на симуляторі — тестове відео webRtcTestVideo.mp4 (або будь-яке інше)
	•	на девайсі — локальна камера обов’язково

⸻

Логіка async / потоків даних

У всіх сервісах (Socket.IO, WebRTC, Coordinator interaction, VM → Service) потрібно використовувати єдиний підхід до асинхронності:

	•	або Swift Concurrency (async/await, AsyncStream)
	•	або Combine (Publisher/Subscriber)

Змішувати ці підходи заборонено у сервісному шарі.
Допускається мікс тільки у SwiftUI-в’юшках, якщо цього вимагають UI-API
(наприклад .task {} + Combine subscription).

Отже:

	•	сервіс WebRTC → повністю async/await або повністю Combine
	•	сервіс SocketIO → теж один підхід
	•	логіка координатора → один підхід

Головне правило

У всіх non-UI шарах має бути єдиний async-патерн без міксування.

Готовий проєкт необхідно розмістити у відкритому GitHub-репозиторії.

⸻

Екран 1 — Login

<img width="3054" height="2228" alt="image" src="https://github.com/user-attachments/assets/af98b13d-9b1f-4704-aed7-c54af84dc80b" />


UI

	•	TextField: username
	•	TextField: roomId (Int)
	•	Button: Продовжити

Логіка

	•	username і roomId зберігаються через UserDefaults / Keychain
	•	після натискання переходити на екран кімнати

⸻

Екран 2 — Room State

<img width="3958" height="2228" alt="image" src="https://github.com/user-attachments/assets/36c4ce5d-d2e1-4bb0-9f8d-615e64d72c42" />

Екран управління з’єднанням із signaling server.

UI

	•	Label: username
	•	Label: roomId
	•	Toggle / Switch: isCaller
	
— після підключення до сокета має змінюватися на статичний текст із роллю

	•	Button:
	•	“Під’єднатись” → коли socket не підключений
	•	“Від’єднатись” → коли socket підключений
	•	Стан peer’a:
	•	показати, чи інший peer знаходиться в кімнаті
	•	peer доступний, коли його роль протилежна до isCaller
	•	Button “Почати дзвінок”
	•	активна тільки коли peer доступний
	•	відкриває Video Chat
	•	Button Logout
	•	очищує username/roomId
	•	повертає на Login

⸻

Події Socket.IO для цього екрана

Підключення peer’a
```
event: room_user_joined
payload:

{
  "username": "Bob",
  "roomId": 1,
  "isCaller": false
}
```
Відключення peer’a
```
event: room_user_left
payload:

{
  "username": "Bob"
}
```
UI має оновлюватися відповідно.

⸻

Екран 3 — Video Chat

<img width="2104" height="2228" alt="image" src="https://github.com/user-attachments/assets/d70a15ec-7c32-4c16-8ccf-ae576958e70e" />

Головний WebRTC-екран.

UI

	•	Remote Video View
	•	Local Video View
	•	Текст: ім’я піра
	•	Кнопка End Call

Основна логіка

Якщо користувач — Caller

	1.	Створює offer
	2.	Емітить offer
	3.	Чекає answer
	4.	Обмін candidate

Якщо користувач — Callee

	1.	Чекає offer
	2.	Встановлює remoteDescription
	3.	Створює answer
	4.	Емітить answer
	5.	Далі candidate

⸻

Логіка завершення дзвінка

	•	Приходить room_user_left
	→ дзвінок завершується
	→ повернення на Room State
	→ WebRTC peer connection закривається

⸻

Симулятор

	•	локальний відеотрек обов’язково використовує webRtcTestVideo.mp4

⸻

Додатково (обов’язково)

Еміти WebRTC

Усі події сигналінгу не типізовані, сервер передає payload як є.

Приклади:
```
offer

{
  "type": "offer",
  "sdp": "STRING"
}
```
```
answer

{
  "type": "answer",
  "sdp": "STRING"
}
```
```
candidate

{
  "candidate": "candidate:...",
  "sdpMid": "0",
  "sdpMLineIndex": 0
}
```

⸻

Socket Server

У комплекті видаються:

	•	index.js
	•	SIGNALING_SERVER_SETUP.md
	•	SIGNALING_PROTOCOL.md

Перед запуском клієнта:
```
npm install
node index.js
```

⸻

Що очікується в результаті

Посилання на GitHub-репозиторій із:

	•	MVVM + Coordinator
	•	Робочий WebRTC дзвінок Caller ↔ Callee
	•	Робота в симуляторі (тестове відео)
	•	Завершення дзвінка при виході peer’a
	•	Правильне керування станами та переходами між екранами
	•	Окремі сервіси:
	•	Socket.IO
	•	WebRTC

Буде плюсом:

	•	Винесення сервісів у окремий Swift Package 
	•	Слідування наданому дизайну
