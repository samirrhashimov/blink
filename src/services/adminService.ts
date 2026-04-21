import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { User } from '../types';

export const AdminService = {
  async getAllUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastActive: data.lastActive?.toDate() || data.createdAt?.toDate() || new Date()
      } as User;
    });
  },

  async getGlobalStats() {
    const users = await this.getAllUsers();
    const totalUsers = users.length;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newUsersToday = users.filter(u => u.createdAt >= today).length;
    const newUsersWeek = users.filter(u => u.createdAt >= lastWeek).length;
    
    const activeUsersToday = users.filter(u => u.lastActive && u.lastActive >= today).length;
    const activeUsersWeek = users.filter(u => u.lastActive && u.lastActive >= lastWeek).length;

    const countries: Record<string, number> = {};
    const devices: Record<string, number> = {};

    users.forEach(u => {
      if (u.lastLoginCountry) {
        countries[u.lastLoginCountry] = (countries[u.lastLoginCountry] || 0) + 1;
      } else {
        countries['Unknown'] = (countries['Unknown'] || 0) + 1;
      }

      if (u.lastLoginDevice) {
        devices[u.lastLoginDevice] = (devices[u.lastLoginDevice] || 0) + 1;
      } else {
        devices['Unknown'] = (devices['Unknown'] || 0) + 1;
      }
    });

    return {
      totalUsers,
      newUsersToday,
      newUsersWeek,
      activeUsersToday,
      activeUsersWeek,
      countries,
      devices,
      allUsers: users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      recentUsers: users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)
    };
  }
};
