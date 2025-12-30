import Message from './Message';

export default function MessageList({ responseText }) {
 
  return (
    <div className="messages">
      {responseText.map(m => (
        <Message key={m.id} message={m} />
      ))}
    </div>
  );
}
