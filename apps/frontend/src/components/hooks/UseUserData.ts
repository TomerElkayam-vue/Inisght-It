import { useEffect, useMemo, useState } from 'react';

import { getPullRequestsSummery } from '../../services/github.service';
import { getIssuesCount } from '../../services/jira.service';
import { UserSpecificStats } from '@packages/github';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';

export const useUserData = () => {
  const [userReviewsData, setUserReviewsData] = useState<
  UserSpecificStats | undefined
  >(undefined);
  const [issuesCount, setUserIssuesCount] = useState<number>(0);
  const { currentProject } = useCurrentProjectContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pullRequestsSummery = await getPullRequestsSummery(currentProject?.id ?? "");
        
        const userStatsInAllSprints: UserSpecificStats = {
          login: 'TomerElkayam-vue',
          pullRequests: [],
          averageCommentsPerPR: 0,
          averagePrTime: 0,
          totalPrTime: 0,
          totalReviewComments: 0,
        };

        pullRequestsSummery.forEach((sprint) => {
          const userStats = sprint.userStats.find(
            (user) => user.login === 'TomerElkayam-vue'
          );
          userStatsInAllSprints.pullRequests.push(
            ...(userStats?.pullRequests || [])
          );
          userStatsInAllSprints.totalReviewComments +=
            userStats?.totalReviewComments || 0;
          userStatsInAllSprints.totalPrTime += userStats?.totalPrTime || 0;
          userStatsInAllSprints.averageCommentsPerPR +=
            userStats?.averageCommentsPerPR || 0;
          userStatsInAllSprints.averagePrTime += userStats?.averagePrTime || 0;
        });
        userStatsInAllSprints.averageCommentsPerPR /= pullRequestsSummery.length;
        userStatsInAllSprints.averagePrTime /= pullRequestsSummery.length;

        setUserReviewsData(userStatsInAllSprints);

        // TODO - fix later
        const issuesCount = await getIssuesCount();

        const currUserStats = issuesCount.find(
          (userStats) => userStats.name === 'Shachar Shemesh'
        );
        const userIssuesCount = currUserStats?.stats
          ? Object.values(currUserStats.stats).reduce(
              (acc, curr) => acc + curr,
              0
            )
          : 0;

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
