import { useRouter } from 'next/router';
import useSWR from 'swr';
import parse from 'html-react-parser';
import Calendar from '../../components/Calendar';
import ActivityOverview from '../../components/ActivityOverview';
import RepoCard from '../../components/RepoCard';
import PieChart from '../../components/PieChart';
import LinearChart from '../../components/LinearChart';
import styles from '../../styles/User.module.css'

export default function User() {
  const router = useRouter();
  const { user: username } = router.query;
  const { data, error } = useSWR(username ? `/api/user/${username}` : null, {
    revalidateOnFocus: false
  });

  if (error) return <div>failed to load {username} profile</div>;

  if (!data) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.description}>
          Loading {username}’s profile stats
        </p>
      </div>
    );
  }

  const { user, repositories } = data;

  const totalStars = repositories.reduce((acc, repo) => acc + repo.node.stargazerCount, 0);
  const totalForks = repositories.reduce((acc, repo) => acc + repo.node.forkCount, 0);

  const mostStarredRepos = repositories
      .concat()
      .sort((a, b) => b.node.stargazerCount - a.node.stargazerCount)
      .slice(0, 3);

  const mostForkedRepos = repositories
      .concat()
      .sort((a, b) => b.node.forkCount - a.node.forkCount)
      .slice(0, 3);

  const forksPerLanguage = repositories
    .reduce((acc, current) => {
      const lang = current?.node?.primaryLanguage?.name;
      acc[lang] = acc[lang] || 0;
      acc[lang] += current.node.forkCount;
      return acc;
    }, {});

  const starsPerLanguage = repositories
    .reduce((acc, current) => {
      const lang = current.node.primaryLanguage?.name;
      acc[lang] = acc[lang] || 0;
      acc[lang] += current.node.stargazerCount;
      return acc;
    }, {})

  const commitsPerLanguage = user.contributionsCollection.commitContributionsByRepository
    .reduce((acc, current) => {
      const lang = current?.repository?.primaryLanguage?.name;
      acc[lang] = acc[lang] || 0;
      acc[lang] += current.contributions.totalCount;
      return acc;
    }, {});

  const commitsPerRepo = user.contributionsCollection.commitContributionsByRepository
    .concat()
    .slice(0, 10)
    .reduce((acc, current) => {
      const lang = current?.repository?.name;
      acc[lang] = acc[lang] || 0;
      acc[lang] += current.contributions.totalCount;
      return acc;
    }, {});

  const languages = repositories
    .reduce((acc, current) => {
      const lang = current?.node?.primaryLanguage?.name;
      acc[lang] = current.node.primaryLanguage?.color;
      return acc;
    }, {});

  const languagesPerRepo = repositories
    .reduce((acc, current) => {
      languages[lang]
      const lang = current?.node?.primaryLanguage?.name;
      acc[lang] = acc[lang] || 0;
      acc[lang]++;
      return acc;
    }, {});

  return (
    <div className={styles.container}>
      <aside className={styles.aside}>
        <div>
          <h1 className={styles.header}>
            <div>{user.name}</div>
            <span>{user.login}</span>
          </h1>

          <div className={styles.bio}>
            <img src={user.avatarUrl} className={styles.avatar} />
            <div>
              {user.bio && <p className='mb05'>{user.bio}</p>}
              {user.status && <p className={styles.status}>{parse(user.status.emojiHTML)} {user.status.message}</p>}
            </div>
          </div>
        </div>

        <div className="mb1">
          <ul className={styles.inlineStats}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M10.119 16.064c2.293-.53 4.427-.994 3.394-2.946-3.147-5.941-.835-9.118 2.488-9.118 3.388 0 5.643 3.299 2.488 9.119-1.065 1.964 1.149 2.427 3.393 2.946 1.985.458 2.118 1.428 2.118 3.107l-.003.828h-1.329c0-2.089.083-2.367-1.226-2.669-1.901-.438-3.695-.852-4.351-2.304-.239-.53-.395-1.402.226-2.543 1.372-2.532 1.719-4.726.949-6.017-.902-1.517-3.617-1.509-4.512-.022-.768 1.273-.426 3.479.936 6.05.607 1.146.447 2.016.206 2.543-.66 1.445-2.472 1.863-4.39 2.305-1.252.29-1.172.588-1.172 2.657h-1.331c0-2.196-.176-3.406 2.116-3.936zm-10.117 3.936h1.329c0-1.918-.186-1.385 1.824-1.973 1.014-.295 1.91-.723 2.316-1.612.212-.463.355-1.22-.162-2.197-.952-1.798-1.219-3.374-.712-4.215.547-.909 2.27-.908 2.819.015.935 1.567-.793 3.982-1.02 4.982h1.396c.44-1 1.206-2.208 1.206-3.9 0-2.01-1.312-3.1-2.998-3.1-2.493 0-4.227 2.383-1.866 6.839.774 1.464-.826 1.812-2.545 2.209-1.49.345-1.589 1.072-1.589 2.334l.002.618z"/></svg>
              <b>{user.followers.totalCount}</b> followers
            </li>
            <li><b>{user.following.totalCount}</b> following</li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 5.173l2.335 4.817 5.305.732-3.861 3.71.942 5.27-4.721-2.524-4.721 2.525.942-5.27-3.861-3.71 5.305-.733 2.335-4.817zm0-4.586l-3.668 7.568-8.332 1.151 6.064 5.828-1.48 8.279 7.416-3.967 7.416 3.966-1.48-8.279 6.064-5.827-8.332-1.15-3.668-7.569z"/>
              </svg>
              <b>{user.starredRepositories.totalCount}</b>
            </li>
          </ul>

          <ul className={styles.inlineStats}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M3.44 1.999l-.439-1.999h17.994l-.439 1.999h-17.116zm18.281 8.001l-1.572 12h-16.352l-1.526-12h19.45zm2.279-2h-24l2.035 16h19.868l2.097-16zm-1.745-2l.371-2h-21.256l.371 2h20.514z"/></svg>
              <b>{user.repositories.totalCount}</b> repositories
            </li>
            <li><b>{user.gists.totalCount}</b> gists</li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12.015 7c4.751 0 8.063 3.012 9.504 4.636-1.401 1.837-4.713 5.364-9.504 5.364-4.42 0-7.93-3.536-9.478-5.407 1.493-1.647 4.817-4.593 9.478-4.593zm0-2c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 3c-2.21 0-4 1.791-4 4s1.79 4 4 4c2.209 0 4-1.791 4-4s-1.791-4-4-4zm-.004 3.999c-.564.564-1.479.564-2.044 0s-.565-1.48 0-2.044c.564-.564 1.479-.564 2.044 0s.565 1.479 0 2.044z"/></svg>
              <b>{user.watching.totalCount}</b>
            </li>
          </ul>

          <ul className={styles.inlineStats}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M15.744 16.683l.349-.199v1.717l-.349.195v-1.713zm3.414-.227l.342-.196v-1.717l-.343.195v1.718zm-1.429.813l.343-.195v-1.717l-.343.195v1.717zm.578-.329l.349-.199v-1.717l-.349.199v1.717zm-1.152.656l.343-.196v-1.717l-.343.196v1.717zm-.821.467l.343-.195v-1.717l-.343.195v1.717zm6.666-11.122v11.507l-9.75 5.552-12.25-6.978v-11.507l9.767-5.515 12.233 6.941zm-12.236-4.643l-2.106 1.19 8.891 5.234-.002.003 2.33-1.256-9.113-5.171zm1.236 10.59l-9-5.218v8.19l9 5.126v-8.098zm3.493-3.056l-8.847-5.208-2.488 1.405 8.86 5.138 2.475-1.335zm5.507-.696l-7 3.773v8.362l7-3.985v-8.15z"/></svg>
              <b>{user.packages.totalCount}</b> packages</li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M22 2v20h-20v-20h20zm2-2h-24v24h24v-24zm-4 7h-8v1h8v-1zm0 5h-8v1h8v-1zm0 5h-8v1h8v-1zm-10.516-11.304l-.71-.696-2.553 2.607-1.539-1.452-.698.71 2.25 2.135 3.25-3.304zm0 5l-.71-.696-2.552 2.607-1.539-1.452-.698.709 2.249 2.136 3.25-3.304zm0 5l-.71-.696-2.552 2.607-1.539-1.452-.698.709 2.249 2.136 3.25-3.304z"/></svg>
              <b>{user.projects.totalCount}</b>
              projects
            </li>
          </ul>

          <ul className={styles.inlineStats}>
            <li>
              <b>{user.sponsorshipsAsMaintainer.totalCount}</b>
              {' '}
              <span>sponsors</span>
            </li>
            <li>
              <b>{user.sponsorshipsAsSponsor.totalCount}</b>
              {' '}
              sponsoring
            </li>
          </ul>
        </div>

        <div className="mb1">
          <ul className={styles.personalInfo}>
            <li>Joined: {user.createdAt}</li>
            {user.location && (
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 2c3.196 0 6 2.618 6 5.602 0 3.093-2.493 7.132-6 12.661-3.507-5.529-6-9.568-6-12.661 0-2.984 2.804-5.602 6-5.602m0-2c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>
                {user.location}
              </li>
            )}
            {user.email && (
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>
                {user.email}
              </li>
            )}
            {user.websiteUrl && (
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M6.188 8.719c.439-.439.926-.801 1.444-1.087 2.887-1.591 6.589-.745 8.445 2.069l-2.246 2.245c-.644-1.469-2.243-2.305-3.834-1.949-.599.134-1.168.433-1.633.898l-4.304 4.306c-1.307 1.307-1.307 3.433 0 4.74 1.307 1.307 3.433 1.307 4.74 0l1.327-1.327c1.207.479 2.501.67 3.779.575l-2.929 2.929c-2.511 2.511-6.582 2.511-9.093 0s-2.511-6.582 0-9.093l4.304-4.306zm6.836-6.836l-2.929 2.929c1.277-.096 2.572.096 3.779.574l1.326-1.326c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.311 1.311-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.051l-2.246 2.245c.236.358.481.667.796.982.812.812 1.846 1.417 3.036 1.704 1.542.371 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.304-4.305c2.512-2.511 2.512-6.582.001-9.093-2.511-2.51-6.581-2.51-9.092 0z"/></svg>
                {user.websiteUrl}
              </li>
            )}
            {user.twitterUsername && (
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                @{user.twitterUsername}
              </li>
            )}
          </ul>
        </div>

        <div className="mb1">
          <h4 className="mb05">Profile Statistics</h4>
          <ul className={styles.inlineStats}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 5.173l2.335 4.817 5.305.732-3.861 3.71.942 5.27-4.721-2.524-4.721 2.525.942-5.27-3.861-3.71 5.305-.733 2.335-4.817zm0-4.586l-3.668 7.568-8.332 1.151 6.064 5.828-1.48 8.279 7.416-3.967 7.416 3.966-1.48-8.279 6.064-5.827-8.332-1.15-3.668-7.569z"/>
              </svg>
              <b>{totalStars}</b></li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                <path d="M21 3c0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.323.861 2.433 2.05 2.832.168 4.295-2.021 4.764-4.998 5.391-1.709.36-3.642.775-5.052 2.085v-7.492c1.163-.413 2-1.511 2-2.816 0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.305.837 2.403 2 2.816v12.367c-1.163.414-2 1.512-2 2.817 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.295-.824-2.388-1.973-2.808.27-3.922 2.57-4.408 5.437-5.012 3.038-.64 6.774-1.442 6.579-7.377 1.141-.425 1.957-1.514 1.957-2.803zm-16.8 0c0-.993.807-1.8 1.8-1.8s1.8.807 1.8 1.8-.807 1.8-1.8 1.8-1.8-.807-1.8-1.8zm3.6 18c0 .993-.807 1.8-1.8 1.8s-1.8-.807-1.8-1.8.807-1.8 1.8-1.8 1.8.807 1.8 1.8z"/>
              </svg>
              <b>{totalForks}</b>
            </li>
          </ul>
          <ul className={styles.inlineStats}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 15.781c-2.084 0-3.781-1.696-3.781-3.781s1.696-3.781 3.781-3.781c1.172 0 2.306.523 3.136 1.669l1.857-1.218c-1.281-1.826-3.133-2.67-4.993-2.67-3.308 0-6 2.692-6 6s2.691 6 6 6c1.881 0 3.724-.859 4.994-2.67l-1.857-1.218c-.828 1.14-1.959 1.669-3.137 1.669z"/></svg>
              <b>TODO:</b> Favorite license:
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb05">Organizations</h4>
          <ul className={styles.inlineStats}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M17.997 18h-11.995l-.002-.623c0-1.259.1-1.986 1.588-2.33 1.684-.389 3.344-.736 2.545-2.209-2.366-4.363-.674-6.838 1.866-6.838 2.491 0 4.226 2.383 1.866 6.839-.775 1.464.826 1.812 2.545 2.209 1.49.344 1.589 1.072 1.589 2.333l-.002.619zm4.811-2.214c-1.29-.298-2.49-.559-1.909-1.657 1.769-3.342.469-5.129-1.4-5.129-1.265 0-2.248.817-2.248 2.324 0 3.903 2.268 1.77 2.246 6.676h4.501l.002-.463c0-.946-.074-1.493-1.192-1.751zm-22.806 2.214h4.501c-.021-4.906 2.246-2.772 2.246-6.676 0-1.507-.983-2.324-2.248-2.324-1.869 0-3.169 1.787-1.399 5.129.581 1.099-.619 1.359-1.909 1.657-1.119.258-1.193.805-1.193 1.751l.002.463z"/></svg>
              <b>{user.organizations.totalCount}</b>
            </li>
          </ul>
        </div>
      </aside>

      <div className={styles.content}>
        <div className={styles.contentSection}>
          <div>
            <div className='mb05'>
              <p>{user.contributionsCollection.contributionCalendar.totalContributions} contributions int the last year</p>
            </div>
            <Calendar data={user.contributionsCollection.contributionCalendar}/>
          </div>
          <div>
            <ActivityOverview
              commits={user.contributionsCollection.totalCommitContributions}
              issues={user.contributionsCollection.totalIssueContributions}
              pullRequests={user.contributionsCollection.totalPullRequestContributions}
              reviews={user.contributionsCollection.totalPullRequestReviewContributions}
              height={130}
            />
          </div>

        </div>

        <div className={styles.contentSection}>
          <div>
            <h4 className='mb05'>Most Starred Repos</h4>
            <ul className={styles.repoCardsList}>
              {mostStarredRepos.map((repo, i) =>
                <li key={i}>
                  <RepoCard data={repo} hideForks />
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className='mb05'>Most Forked Repos</h4>
            <ul className={styles.repoCardsList}>
              {mostForkedRepos.map((repo, i) =>
                <li key={i}>
                  <RepoCard data={repo} hideStars />
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div>
            <h4 className="mb05">Forks per language</h4>
            <PieChart data={forksPerLanguage} end="100%" colors={languages}/>
          </div>
          <div>
            <h4 className="mb05">Stars per language</h4>
            <PieChart data={starsPerLanguage} colors={languages}/>
          </div>
          <div>
            <h4 className="mb05">Commits per language</h4>
            <PieChart data={commitsPerLanguage}/>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div>
            <h4 className="mb05">Language per Repo</h4>
            <PieChart data={languagesPerRepo} colors={languages}/>
          </div>
          <div>
            <h4 className="mb05">Commits per Repo (top 10)</h4>
            <PieChart data={commitsPerRepo}/>
          </div>
        </div>
      </div>

    </div>
  );
}
