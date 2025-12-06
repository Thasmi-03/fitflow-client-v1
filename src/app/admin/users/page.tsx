'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, Search, Filter } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { UserProfile } from '@/types/user';

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'styler' | 'partner'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getUsers();
            setUsers(response.users);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                console.log('Users endpoint not found (404) - using empty fallback');
                toast.error('Users endpoint not yet implemented on backend');
                setUsers([]);
            } else {
                console.error('Error loading users:', error);
                toast.error('Failed to load users');
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter and search users
    const filteredUsers = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];
        return users.filter(user => {
            // Search filter
            const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.name?.toLowerCase().includes(searchTerm.toLowerCase());

            // Role filter
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            // Status filter
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'approved' && user.isApproved) ||
                (statusFilter === 'pending' && !user.isApproved);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-50">
                <AdminDashboardSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                Users
                            </h1>
                            <p className="mt-2 text-gray-600">
                                User Management
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="px-3 py-2 border rounded-md text-sm bg-white"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as any)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="styler">Stylers</option>
                                    <option value="partner">Partners</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600">Loading users...</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium">No users found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3">Email</th>
                                                    <th className="px-6 py-3">Role</th>
                                                    <th className="px-6 py-3">Status</th>
                                                    <th className="px-6 py-3">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => (
                                                    <tr key={user._id} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${user.role === 'styler' ? 'bg-purple-100 text-purple-800' :
                                                                user.role === 'partner' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isApproved
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {user.isApproved ? 'Active' : 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
