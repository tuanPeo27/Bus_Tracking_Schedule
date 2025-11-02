import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNotificationHelpers } from './useNotificationHelpers';
import { useNotifications } from './NotificationContext';
import { useIsMobile } from './ui/use-mobile';
import { 
  Bus, 
  Bell, 
  LogOut, 
  LayoutDashboard,
  MapPin,
  MessageSquare,
  User,
  Clock,
  KeyRound
} from 'lucide-react';
import { ParentDashboard } from './parent/ParentDashboard';
import { ParentTracking } from './parent/ParentTracking';
import { ParentNotifications } from './parent/ParentNotifications';
import { ParentMessages } from './parent/ParentMessages';
import { ChangePassword } from './ChangePassword';

export function ParentApp({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreadCount] = useState(3);
  const { system } = useNotificationHelpers();
  const { clearAll } = useNotifications();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    clearAll(); // Clear tất cả notifications trước khi logout
    system.logout();
    onBack();
  };

  const parentInfo = {
    id: 'PH001',
    name: 'Bà Nguyễn Thị Lan',
    avatar: 'NTL',
    children: [
      {
        id: 'HS001',
        name: 'Nguyễn Minh Anh',
        class: '10A1',
        school: 'THPT Nguyễn Du',
        route: 'Tuyến 1',
        vehicle: '29A-12345',
        driver: 'Nguyễn Văn Minh'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                  {isMobile ? 'Phụ huynh' : 'Giao diện Phụ huynh'}
                </h1>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    Theo dõi hành trình con em
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {!isMobile && (
                <div className="relative">
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}
              
              <Avatar className={isMobile ? 'w-8 h-8' : ''}>
                <AvatarFallback className={`bg-purple-600 text-white ${isMobile ? 'text-sm' : ''}`}>
                  {parentInfo.avatar}
                </AvatarFallback>
              </Avatar>

              {!isMobile && (
                <div className="text-right">
                  <p className="font-medium">{parentInfo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {parentInfo.children.length} con em
                  </p>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className={isMobile ? 'px-2' : ''}
              >
                <LogOut className="w-4 h-4" />
                {!isMobile && <span className="ml-2">Đăng xuất</span>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className={isMobile ? 'px-2' : 'px-4'}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`${isMobile ? 'h-16 w-full justify-start' : 'h-12'} bg-transparent border-0 ${isMobile ? 'overflow-x-auto' : ''}`}>
              <TabsTrigger value="dashboard" className={`${isMobile ? 'flex-col gap-1 min-w-[60px] text-xs' : 'gap-2'}`}>
                <LayoutDashboard className="w-4 h-4" />
                {isMobile ? 'Tổng' : 'Tổng quan'}
              </TabsTrigger>
              <TabsTrigger value="tracking" className={`${isMobile ? 'flex-col gap-1 min-w-[60px] text-xs' : 'gap-2'}`}>
                <MapPin className="w-4 h-4" />
                {isMobile ? 'GPS' : 'Theo dõi xe buýt'}
              </TabsTrigger>
              <TabsTrigger value="notifications" className={`${isMobile ? 'flex-col gap-1 min-w-[60px] text-xs relative' : 'gap-2'}`}>
                <Bell className="w-4 h-4" />
                {isMobile ? 'T.báo' : 'Thông báo'}
                {unreadCount > 0 && (
                  <Badge className={`bg-red-500 text-white text-xs px-1.5 py-0.5 ${isMobile ? 'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0' : 'ml-1'}`}>
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="messages" className={`${isMobile ? 'flex-col gap-1 min-w-[60px] text-xs' : 'gap-2'}`}>
                <MessageSquare className="w-4 h-4" />
                {isMobile ? 'T.nhắn' : 'Tin nhắn'}
              </TabsTrigger>
              <TabsTrigger value="password" className={`${isMobile ? 'flex-col gap-1 min-w-[60px] text-xs' : 'gap-2'}`}>
                <KeyRound className="w-4 h-4" />
                {isMobile ? 'Đổi MK' : 'Đổi mật khẩu'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className={isMobile ? 'p-2' : 'p-4'}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="mt-0">
            <ParentDashboard 
              parentInfo={parentInfo}
            />
          </TabsContent>

          <TabsContent value="tracking" className="mt-0">
            <ParentTracking 
              children={parentInfo.children}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <ParentNotifications 
              parentId={parentInfo.id}
            />
          </TabsContent>

          <TabsContent value="messages" className="mt-0">
            <ParentMessages 
              parentId={parentInfo.id}
            />
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <ChangePassword 
              username="phuhuynh01"
              userRole="parent"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}