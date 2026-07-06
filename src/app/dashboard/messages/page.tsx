import { Messages } from "@/components/messages/messages";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Chat with your consultant and AI assistant in one place.</p>
      </div>
      <Messages />
    </>
  );
}
