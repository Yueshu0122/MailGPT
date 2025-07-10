// The import path was incorrect or the file does not exist. 
// Let's assume the correct path is './components/MailInbox' (relative to 'app/protected/')
// If the file is actually in 'app/components/MailInbox.tsx', update the import accordingly.

import MailInbox from '../../components/MailInbox';

export default function Home() {
  return <MailInbox />;
}
