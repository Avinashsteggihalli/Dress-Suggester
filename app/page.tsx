import { requireChatGPTUser, chatGPTSignOutPath } from './chatgpt-auth';
import Wearly from './wardrobe-app';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await requireChatGPTUser('/');
  return <Wearly user={{id:user.userId,name:user.fullName || 'My account',email:user.email}} signOut={chatGPTSignOutPath('/')} />;
}
