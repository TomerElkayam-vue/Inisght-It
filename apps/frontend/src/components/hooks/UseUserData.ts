import { useEffect, useMemo, useState } from 'react';
import { UserActivity } from '../../types/github-activity';
import { getPullRequestsSummery } from '../../services/github.service';
import { getIssuesCount } from '../../services/jira.service';

export const useUserData = () => {
  const [userReviewsData, setUserReviewsData] = useState<
    UserActivity | undefined
  >(undefined);
  const [issuesCount, setUserIssuesCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pullRequestsSummery = await getPullRequestsSummery();
        setUserReviewsData(
          pullRequestsSummery.find((user) => user.login === 'TomerElkayam-vue')
        );
        const issuesCount = await getIssuesCount();
        setUserIssuesCount(issuesCount['Tomer Elkayam']);
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
