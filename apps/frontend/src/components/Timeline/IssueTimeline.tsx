import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/style.css';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import {
  getDetailedSprints,
  getSprintsIssuesChangelog,
} from '../../services/jira.service';
import './styles.css';
import { IssueWithMrAndChangelog } from '@packages/jira';
import { itemRender } from './issueRedner';

export const IssueTimeline = () => {
  const { currentProject } = useCurrentProjectContext();
  const [loadingChangelog, setLoadingChangelog] = useState<boolean>(true);
  const [currentSprints, setCurrentSprints] = useState<
    {
      name: string;
      id: number;
    }[]
  >();
  const [selectedSprintId, setSelectedSprintId] = useState<number>();
  const [issuesTimelines, setIssuesTimelines] =
    useState<IssueWithMrAndChangelog[]>();

  useEffect(() => {
    const fetchSprints = async () => {
      if (currentProject) {
        const sprints = await getDetailedSprints(currentProject.id);
        setCurrentSprints(sprints);
      }
    };
    fetchSprints();
  }, [currentProject]);

  useEffect(() => {
    const fetchSprintsIssuesChanglog = async () => {
      if (
        currentProject &&
        selectedSprintId &&
        issuesTimelines?.[0].sprint !== selectedSprintId
      ) {
        const changelog = await getSprintsIssuesChangelog(
          currentProject?.id,
          String(selectedSprintId)
        );
        setLoadingChangelog(false);
        setIssuesTimelines(changelog);
      }
    };
    fetchSprintsIssuesChanglog();
  }, [selectedSprintId, currentProject]);

  const timelineGroups = useMemo(() => {
    const assigneeSet = new Set<string>();

    issuesTimelines?.forEach((issue) => assigneeSet.add(issue.assignee));

    return Array.from(assigneeSet).map((assignee, index) => ({
      id: index,
      title: assignee,
    }));
  }, [issuesTimelines]);

  const timelineItems = useMemo(() => {
    return issuesTimelines?.map((issue) => ({
      id: issue.id,
      group:
        timelineGroups.find((group) => group.title === issue.assignee)?.id ?? 0,
      title: issue.name,
      start_time: moment(issue.created),
      end_time: moment(issue.mergedAt),
      createdAt: moment(issue.createdAt),
      inProgress: moment(issue.inProgress),
    }));
  }, [issuesTimelines, timelineGroups]);

  const timelineStart = useMemo(() => {
    return timelineItems?.sort(
      (firstItem, secondItem) =>
        firstItem.start_time.unix() - secondItem.start_time.unix()
    )[0]?.start_time;
  }, [timelineItems]);

  const timelineEnd = useMemo(() => {
    return timelineItems?.sort(
      (firstItem, secondItem) =>
        firstItem.start_time.unix() - secondItem.start_time.unix()
    )[timelineItems.length - 1]?.end_time;
  }, [timelineItems]);

  return (
    <div className="w-full max-w-full px-4 py-4 items-center justify-center relative overflow-x-hidden">
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        <p
          style={{ color: 'white' }}
          className="text-center text-lg font-medium"
        >
          בחר ספרינט על מנת לראות את לוח הזמנים
        </p>
        <select
          className="p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white"
          value={selectedSprintId}
          onChange={(e) => {
            setLoadingChangelog(true);
            setSelectedSprintId(Number(e.target.value));
          }}
        >
          {currentSprints?.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSprintId ? (
        !loadingChangelog ? (
          <Timeline
            groups={timelineGroups ?? []}
            items={timelineItems ?? []}
            //@ts-ignore
            defaultTimeStart={timelineStart ?? moment().subtract(1, 'days')}
            //@ts-ignore
            defaultTimeEnd={timelineEnd ?? moment()}
            itemRenderer={itemRender}
            stackItems={false}
            lineHeight={60}
            minZoom={60 * 60 * 1000}
            maxZoom={7 * 24 * 60 * 60 * 1000 * 100}
          />
        ) : (
          <div className="absolute inset-0 bg-[#151921] bg-opacity-90 flex items-center justify-center z-0">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white text-lg">טוען מידע...</span>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
};
