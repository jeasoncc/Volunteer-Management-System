# 考勤管理模块优化示例代码

本文档提供具体的优化示例代码，可直接参考使用。

## 1. 自定义 Hooks

### 1.1 useDebounce Hook

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例
function CheckinFilters() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    // 使用 debouncedSearch 进行 API 调用
  }, [debouncedSearch]);
}
```

### 1.2 useCheckinFilters Hook

```typescript
// hooks/useCheckinFilters.ts
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useDebounce } from './useDebounce';

export interface CheckinFilters {
  startDate: string;
  endDate: string;
  lotusId: string;
  page: number;
  pageSize: number;
}

export function useCheckinFilters(initialPageSize = 20) {
  const [startDate, setStartDate] = useState(
    dayjs().subtract(30, 'day').format('YYYY-MM-DD')
  );
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [lotusId, setLotusId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // 防抖处理
  const debouncedLotusId = useDebounce(lotusId, 300);

  const filters = useMemo<CheckinFilters>(
    () => ({
      startDate,
      endDate,
      lotusId: debouncedLotusId,
      page,
      pageSize,
    }),
    [startDate, endDate, debouncedLotusId, page, pageSize]
  );

  const resetFilters = () => {
    setStartDate(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
    setEndDate(dayjs().format('YYYY-MM-DD'));
    setLotusId('');
    setPage(1);
  };

  return {
    filters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    lotusId,
    setLotusId,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  };
}
```

## 2. 组件拆分示例

### 2.1 CheckinFilters 组件

```typescript
// components/checkin/CheckinFilters.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Search } from 'lucide-react';
import { useCheckinFilters } from '@/hooks/useCheckinFilters';

interface CheckinFiltersProps {
  onFilterChange?: (filters: ReturnType<typeof useCheckinFilters>['filters']) => void;
}

export function CheckinFilters({ onFilterChange }: CheckinFiltersProps) {
  const {
    filters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    lotusId,
    setLotusId,
    resetFilters,
  } = useCheckinFilters();

  // 当 filters 变化时通知父组件
  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选条件</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              开始日期
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              结束日期
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              莲花斋ID
            </label>
            <Input
              placeholder="输入莲花斋ID筛选"
              value={lotusId}
              onChange={(e) => setLotusId(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={resetFilters} variant="outline" className="flex-1">
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2.2 CheckinStats 组件

```typescript
// components/checkin/CheckinStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, CalendarCheck } from 'lucide-react';

interface CheckinStatsProps {
  totalVolunteers: number;
  totalHours: number;
  totalDays: number;
  isLoading?: boolean;
}

export function CheckinStats({
  totalVolunteers,
  totalHours,
  totalDays,
  isLoading,
}: CheckinStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">参与义工</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVolunteers}</div>
          <p className="text-xs text-muted-foreground">人</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总服务时长</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">小时</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总打卡次数</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDays}</div>
          <p className="text-xs text-muted-foreground">次</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 3. 类型定义完善

### 3.1 完整的类型定义

```typescript
// types/checkin.ts
export interface CheckInRecord {
  id: number;
  userId: number;
  lotusId: string;
  name: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  originTime: string;
  recordType: 'face' | 'manual' | 'card' | 'password';
  deviceSn?: string;
  location?: string;
  status?: 'present' | 'late' | 'early_leave' | 'absent' | 'on_leave';
  notes?: string;
}

export interface CheckInSummary {
  id: number;
  userId: number;
  lotusId: string;
  name: string;
  date: string;
  firstCheckinTime?: string;
  lastCheckinTime?: string;
  firstCheckIn?: string;
  lastCheckIn?: string;
  checkinCount?: number;
  totalDays?: number;
  workHours: number;
  totalHours?: number;
  status?: 'present' | 'late' | 'early_leave' | 'absent' | 'on_leave' | 'manual';
  isManual?: boolean;
  notes?: string;
  month?: string;
}

export interface MonthlyReportData {
  volunteers: CheckInSummary[];
  stats: {
    totalVolunteers: number;
    totalHours: number;
    totalDays: number;
  };
}

export interface CheckInRecordsResponse extends PaginationResponse<CheckInRecord> {
  stats?: {
    total: number;
    newThisMonth: number;
  };
}

export interface MonthlyReportResponse {
  data: MonthlyReportData;
  success: boolean;
  message?: string;
}
```

## 4. 服务层优化

### 4.1 优化的服务方法

```typescript
// services/checkin.ts (部分优化)
import { type ApiResponse, api } from '../lib/api';
import type {
  CheckInRecord,
  CheckInSummary,
  CheckInRecordsResponse,
  MonthlyReportResponse,
} from '../types/checkin';

export interface CheckInListParams extends PaginationParams {
  lotusId?: string;
  startDate?: string;
  endDate?: string;
}

export const checkinService = {
  /**
   * 获取考勤记录列表（带类型安全）
   */
  getList: async (
    params: CheckInListParams
  ): Promise<ApiResponse<CheckInRecordsResponse>> => {
    return api.get('/api/v1/summary/list', { params });
  },

  /**
   * 获取月度考勤报表（带类型安全）
   */
  getMonthlyReport: async (
    params: MonthlyReportParams
  ): Promise<ApiResponse<MonthlyReportResponse>> => {
    return api.get('/api/v1/report/monthly', { params });
  },

  // ... 其他方法
};
```

## 5. 错误处理优化

### 5.1 错误边界组件

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              出现错误
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <Button onClick={this.handleReset} variant="outline">
              重试
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

### 5.2 优化的错误处理 Hook

```typescript
// hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { toast } from '@/lib/toast';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, defaultMessage?: string) => {
    let message = defaultMessage || '操作失败';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    }

    toast.error(message);
    console.error('Error:', error);
  }, []);

  return { handleError };
}
```

## 6. 配置管理

### 6.1 配置文件

```typescript
// config/checkin.ts
export const CHECKIN_CONFIG = {
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },
  debounce: {
    search: 300,
    filter: 500,
  },
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  defaultDateRange: {
    days: 30,
  },
} as const;

export type CheckinConfig = typeof CHECKIN_CONFIG;
```

## 7. 重构后的主页面示例

### 7.1 优化后的 checkin.tsx

```typescript
// routes/checkin.tsx (重构后)
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkinService } from '@/services/checkin';
import { CheckinFilters } from '@/components/checkin/CheckinFilters';
import { CheckinStats } from '@/components/checkin/CheckinStats';
import { CheckinTable } from '@/components/CheckinTable';
import { CheckinRecordsTable } from '@/components/CheckinRecordsTable';
import { CheckinViewSwitcher } from '@/components/checkin/CheckinViewSwitcher';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CHECKIN_CONFIG } from '@/config/checkin';
import type { CheckinFilters as CheckinFiltersType } from '@/hooks/useCheckinFilters';

export const Route = createFileRoute('/checkin')({
  component: CheckinPage,
} as any);

function CheckinPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'summary' | 'records'>('summary');
  const [filters, setFilters] = useState<CheckinFiltersType | null>(null);

  // 月度报表查询
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['checkin', 'monthly-report', filters?.startDate, filters?.endDate],
    queryFn: () => checkinService.getMonthlyReport({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    }),
    enabled: isAuthenticated && viewMode === 'summary',
  });

  // 记录列表查询
  const { data: recordsData, isLoading: recordsLoading } = useQuery({
    queryKey: ['checkin', 'records', filters],
    queryFn: () => checkinService.getList(filters || {}),
    enabled: isAuthenticated && viewMode === 'records' && !!filters,
  });

  if (authLoading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const report = reportData?.data?.data || {};
  const volunteers = report.volunteers || [];
  const records = recordsData?.data?.data || [];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">考勤管理</h1>
          <CheckinViewSwitcher
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {viewMode === 'summary' ? (
          <>
            <CheckinStats
              totalVolunteers={volunteers.length}
              totalHours={volunteers.reduce((sum: number, v: any) => sum + (v.totalHours || 0), 0)}
              totalDays={volunteers.reduce((sum: number, v: any) => sum + (v.totalDays || 0), 0)}
              isLoading={reportLoading}
            />
            <CheckinTable
              data={volunteers}
              isLoading={reportLoading}
            />
          </>
        ) : (
          <>
            <CheckinFilters onFilterChange={setFilters} />
            <CheckinRecordsTable
              data={records}
              isLoading={recordsLoading}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
```

## 8. 性能优化示例

### 8.1 使用 React.memo

```typescript
// components/CheckinTable.tsx (优化后)
import React from 'react';
import { useReactTable, /* ... */ } from '@tanstack/react-table';

interface CheckinTableProps {
  data: CheckinData[];
  isLoading?: boolean;
  onViewDetails?: (lotusId: string) => void;
}

export const CheckinTable = React.memo(function CheckinTable({
  data,
  isLoading,
  onViewDetails,
}: CheckinTableProps) {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.data === nextProps.data &&
    prevProps.isLoading === nextProps.isLoading
  );
});
```

### 8.2 使用 useMemo 优化计算

```typescript
// 在组件中使用
const stats = useMemo(() => {
  return {
    totalVolunteers: volunteers.length,
    totalHours: volunteers.reduce((sum, v) => sum + (v.totalHours || 0), 0),
    totalDays: volunteers.reduce((sum, v) => sum + (v.totalDays || 0), 0),
  };
}, [volunteers]);
```

## 9. 测试示例

### 9.1 组件测试

```typescript
// components/__tests__/CheckinStats.test.tsx
import { render, screen } from '@testing-library/react';
import { CheckinStats } from '../checkin/CheckinStats';

describe('CheckinStats', () => {
  it('应该显示统计数据', () => {
    render(
      <CheckinStats
        totalVolunteers={10}
        totalHours={100.5}
        totalDays={50}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('100.5')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('应该在加载时显示骨架屏', () => {
    render(
      <CheckinStats
        totalVolunteers={0}
        totalHours={0}
        totalDays={0}
        isLoading={true}
      />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
```

---

## 📝 使用建议

1. **渐进式重构**：不要一次性替换所有代码，逐步迁移
2. **保持测试**：每次重构都要确保测试通过
3. **代码审查**：重要变更要进行代码审查
4. **性能监控**：监控优化前后的性能指标
5. **文档更新**：及时更新相关文档

---

## 🔗 相关资源

- [React Hooks 最佳实践](https://react.dev/reference/react)
- [TypeScript 类型系统](https://www.typescriptlang.org/docs/handbook/2/types.html)
- [TanStack Query 优化指南](https://tanstack.com/query/latest/docs/react/guides/performance)



