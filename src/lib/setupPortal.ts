import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export async function setupInitialPortal(userUid: string, userEmail: string) {
  try {
    // 1. Add admin
    await setDoc(doc(db, 'admins', userUid), {
      email: userEmail,
      role: 'owner'
    });

    // 2. Add categories
    const categories = [
      { id: 'silvio-santos', name: 'Silvio Santos', slug: 'silvio-santos', order: 1 },
      { id: 'nostalgia', name: 'Nostalgia', slug: 'nostalgia', order: 2 },
      { id: 'celebridades', name: 'Celebridades', slug: 'celebridades', order: 3 },
      { id: 'por-onde-anda', name: 'Por Onde Anda?', slug: 'por-onde-anda', order: 4 },
      { id: 'novelas', name: 'Novelas', slug: 'novelas', order: 5 },
      { id: 'programas-de-tv', name: 'Programas de TV', slug: 'programas-de-tv', order: 6 },
    ];

    for (const cat of categories) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    // 3. Add initial settings
    await setDoc(doc(db, 'settings', 'general'), {
      siteName: 'Memórias da TV',
      siteDescription: 'Portal de Nostalgia Televisiva',
      adsEnabled: false,
      siteEmail: 'contato@memoriasdatv.com.br'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'setupPortal');
  }
}
