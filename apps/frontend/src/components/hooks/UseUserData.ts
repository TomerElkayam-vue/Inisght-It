import { useEffect, useMemo, useState } from 'react';

import { getPullRequestsSummery } from '../../services/github.service';
import { getIssuesCount } from '../../services/jira.service';
import { UserSpecificStats } from '@packages/github';

export const useUserData = () => {
  const [userReviewsData, setUserReviewsData] = useState<
    UserSpecificStats | undefined
  >(undefined);
  const [issuesCount, setUserIssuesCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pullRequestsSummery = await getPullRequestsSummery();
        setUserReviewsData(
          pullRequestsSummery.find((user) => user.login === 'TomerElkayam-vue')
        );

        // TODO - fix later
        const issuesCount = await getIssuesCount();
        
        const currUserStats = issuesCount.find(userStats => userStats.name === 'Shachar Shemesh');
        const userIssuesCount = currUserStats?.stats ? Object.values(currUserStats.stats).reduce((acc, curr) => acc + curr, 0) : 0
        
        setUserIssuesCount(userIssuesCount);
      } catch (err) {
        console.error('Error fetching issues count:', err);
      }
    };

    fetchData();
  }, []);

  const userData = useMemo(() => {
    return {
      username: 'Tomer Elkayam',
      issuesCount,
      amountOfPR: userReviewsData?.pullRequests.length,
      averageCommentsPerPR: userReviewsData?.averageCommentsPerPR,
    };
  }, [issuesCount, userReviewsData]);

  return { userData };
};
