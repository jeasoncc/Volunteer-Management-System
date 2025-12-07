import {useQuery} from '@tanstack/react-query';
import {checkinService} from '../services/checkin';
import {useAuth} from '../context/AuthContext';

export function useCheckinRecords(params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['checkin-records', user?.lotusId, params],
    queryFn: () =>
      checkinService.getUserRecords(user?.lotusId || '', {
        ...params,
        page: params?.page || 1,
        pageSize: params?.pageSize || 50,
      }),
    enabled: !!user?.lotusId,
    staleTime: 30000, // 30秒内不重新获取
  });
}

