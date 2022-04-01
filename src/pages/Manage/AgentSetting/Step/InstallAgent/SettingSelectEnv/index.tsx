import React, { FC, memo } from 'react';
import styles from './index.css';
import { Card } from '@alicloud/console-components';

interface IPorps {
  enable: boolean;
  handleSelectEnv: (mode: string) => void;
}

const K8S = 'k8s';
const PUBLIC = 'public';
const SettingSelectEnv: FC<IPorps> = ({ enable, handleSelectEnv }) => {

  const handleClick = (key: string) => {
    if (enable) {
      handleSelectEnv(key);
    }
  };

  return (
    <div className={styles.content}>
      <h1>
        请选择您要安装的环境
      </h1>
      <div className={styles.container}>
        <ul>
          <li
            onClick={() => handleClick(PUBLIC)}
            data-spm-click="gostr=/aliyun;locaid=d_SettingSelectEnv_card_ecs"
          >
            <Card className={styles['install-card']}>
              <span className={styles['install-card-text']}>
                <span>
                  主机
                  <div className={styles.txc} style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src="data:image/png;base64,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"
                      alt=""
                      style={{ width: 64, height: 64 }}
                    />
                  </div>
                </span>
              </span>
            </Card>
          </li>
          <li
            onClick={() => handleClick(K8S)}
            data-spm-click="gostr=/aliyun;locaid=d_SettingSelectEnv_card_ecs"
          >
            <Card className={enable ? styles['install-card'] : styles['card-disable']}>
              <span className={styles['install-card-text']}>
                <span>
                  自建Kubernetes
                  <div className={styles.txc} style={{ marginTop: '10px' }}>
                    <img
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAMcklEQVR4XuWbf3QcVRXHP3c2ISXpD0HKAQWhzc6iFkH8AaiIoAIq+AvlhyjiDxCwiLRkJqUHMYqldDdtFUVABTyioohYEEX8CXgUREU5AsLOhlLrL6BqKU2bNtm5njez2c1kZzczmy16Du+vnJ1777vv++677/54EZ7lQ57l6+d/B8Alf30unVuOQa0OOrpuZfHe//5fbMYzD8Cl3gIy9AOnAJnKosuo3oAln6HPfuiZBOKZA6BQPATkAuDtTRaoqP4AlWX02/c8E0DseAAGi0fhywUIR6ZakHInFsvps29PxZeSeMcAMKAWMx99B+pfCByUUqcouXJfAMTm7E0MiD8tWTHM7QXgKu3kKe+9wBJE9mursqqPIKxg2L6OARlrl+z2ALBq/c6MbTsd1EXYq13KNZCzHtWVdOz8JRbvvXW6c00PgNVrn8NYeSH4i0F2na4y6fh1A8rn8DOfZ0nvU+l4a9StAZBfuweUF4F/NiKzWp0c5GKUJxH9HLQYk6g+DdYV7GSt4rz5j6fVJR0AhcfmoaMOwoeArrSTRehV78XNHRL8li/+AZGXTk8eI8C1+NalLOn9S1JZyQAolPZHdQnCyROCl6RzxNMp9+Dar6oA8BAiL5qewCp3GeVbWFySJKhqDsDAgzvR07kM5PyWTbTRqpR/4tp7hgB4WxFmtAmAcTEKupLZ9lLOlNFGspsDUPA+CQy0WbGago5tseLhWViZTTtoDkAvwsldnB6AAe2gu/QEwi47SLmNOPYuBFfoyAaE7h0yj/I4W7J7NYodGltAGLvvmHhcdTvIpbi2sTAoeJcAC4HZOwQEP3MI/fPvjZPdBABvMbCyLQopPsJPEL7CrOzNDc/kqkeez2jmlYiegvC2ad80tcO2GNdenRKA4ndBjm8CwI2o3AX+soaxgOq/EPkCllzN+dn1qcAMfcM5KBc1cZAbUS5EMNfpqQ3lq34XN/fudADkixsQeW5DoR0du7Bo3kYGhw7D929CmBul1fvx5Tj67b+mWvhk4pWlvSn7VyLylsgnc4to5u2Bad+gGdaVjKePt2izEW5ut+QArCplKavXXHG5mEzX8iAeD+lvA7IBj/JtZnAa59rbIjIGvRfjy2mIfwwql+Ha14TXYPE9IB8AbqGz8yYW7fuP6GJVKJQKCOY6NhM8jC9HVcEdLJ2G6leb6tuhvSzKPTqZJh6xJALDhf4J33ovS3r/RJAXjJ0HbMKxV0UmyhffBWICqVdUf1c5GTf77dAJlt4JelPtm95LpuMjnD///oicQukc8HehnLksiP8NoMonUd6NYDUFQHg/ffZ1yQAoeF8CzkhsuioObnawjj68SvMIi+q+GZPuyxqrgRVDb8Dyfzpp17cjckEdmONEee90hCuTR6Z6FU7urKQAPAi8ODEAgTVYOdze2rEJagOluxAOjZWjchhu9lfBt8GhV6J+7DUF3MZw9m2RezwoqG41TnXnFDo+gGO/ZGoAWonMTEZW7tqHC/b5T2SClaVXU/avQ2R+naJl64Dg6AQW8Oh+WOWHYxazDktO4fzsryPflq/dl46xUvLdr3D75dn0v/DpibLqfUC+eBwi30+BrNl+FydXiOUp/LMHNq0EOTPyvWztU83aTHotY1HHB1fTPec8Fu6+OV6u93ngnFR6Tjx2FcYYALzlCEsSC1ZGkFm74ewxXDHnw0C30pf9fURGvvQm0GsR9gjcZxfP4Vw7zAFMOFwe2RL8HcYOH8Sxo5sQRKZWD0725xWeXSmPrE0XPeoynJypU1ZHnAXchchrkwOg1+PmTI0/HHnvZuBo0BNwc7dG5JibYnR0NWKVcLLLIt8Gi2fhy6sQcXCyT0S/DR2PX74e5AFc++UT5rq6UptIqu4dOHakOh0FIPDaJjWVjqQSUetY3N4fBvRB0KKPVa4kk472NzwaSSfIe+b6XF4lt+Q1VZ9grleRG5OKwljrluysiQ41CsAK71As7k4s0BB2z5lVPadhUmOaHxPHl9knezYnSjmVXBPdPVa6BnN/TxzK5bh2ePYv82azjXT1QLEOpq/3t+MiowDkS32IxjuzOO1Nquna5kyPm/8dCK+LIb0Nx46Gss3QMH2Fbu9HiBxVT6YP4+Rq1aO8tz5lJXoRjv3ZBgB430N4R+KdUv0lbu7wKn2heD/IAbH8lrwgkhAVih8ECUNh1X7cXL7Kt/qxPRkb/XsDPco4du2IFrxfAEck1hluxLFPaADAFAnQ5FmUH+Pax0ywgOhuBGmw/hrfWkN/tpZa19/jStk6sBoXGIGD3qn4eioiBuBoAbaLOdUbpODdArw1MQCTEqPaEcgP2YhfTCwoJLwbx371BACGEdPx1Z+isgbLX0PffhvqZA6snUH36NMRZzu6824s3etf8bRjhyMYoI8G9me4p4eB54XXZt67HQl+TzE65+Psa67QCeljvvgBRK5NISVMhly7ZvJ57wR65tzWMHiZKDzvrUL4KKoC8jVcO1nuUSjtznDvhmqfMO818jvNlnIqjv31KAAF7yvAh1MAYMrPH8e1L0/BEyVdtX5XRkYyLLWfbFlGwXsf6DUgnYllqFyJmz17EgDFP4O8sKEQ5RaQKxAdQTNlypkH6mL/icwmBLY2H0hZD0KCDvHuKItw7aGmig6WXo6vpgr0OMofEP7IcM/9VZOPYzbX4XbrAJQZ+Hog4r++roAykW+C5YY+IMyu6s/qONNkUze/G1Ps8GdGigyB996+CuUgRHJ1FRqTu7v2p5sCEBdLhM60GAAyJh9PZDEFz2SmYYEmblQSoxCAvPc6hDsaK6abYacDGJONdGw/HPQMkGMDemUNrv3OKm/BM5lb2PGpH0fi2E3mCSrE5gXJmlhu82jCtWtXXt5bDnoySBnhN/jyHdzemxkcWgD6u6ZF1UpAVAGg9CYkKGmlH2Z3fGteLbPzXoYQTYRCqQ/h2AuqEwR1PO9HqGxmTvbEaqU4CIJK62KDG2FBtd11mdfFNkzO0FopvVIqDwEIawAmlx9/tJQOCMXU+GshcN77FsJJUSF6Fk7uqpqlFM8EMRUdUDkXN2vS23DERaTKN3Dt99X4S2eAmspV+mHqF+o/39QGanFAwfta09Jy02l0GOlYQN/8dQFZmPXdjsjBFbZNDPfsWXVkA3/vpmfY3MO7h9/133TJvGpwE8b4ZnfHA6C7KVtvrr4DCGsMHkjYW0w7VD+Dm/uEYasBYJTq3nxfy09blF/hZF+LiAb6BC2vrTcgchzKalzbNFoqO+wtQ1ga0Vslj5s1z+fCUatL3kwXJ0UqzHnvywinp113iDX3MSd76PiRm5QMeb3A7xHmtCa8dr8G/GFSczUZ66JqHrDiL89Dtg3VNzt0FH/GvvS/IMwBVhRfhEgfTvb0KqgBMNMwfXgCv+ug6hyxjYTC0BtR34SXzcvMjRBSPl3t+cXRND9q38SxzSOr+JEvnYTo9a216g3Acvjk94fxfYGCZxyaye1bG6ZJsWXmwrrgJSx9fRXlyGgnSU1X5yFU/kHHjONjHz8VPNNzMKX3Vh31R3HtKyYvqFl3eKreYHNwlCEsOamuNpgW0rB9bmqJk26VVIKuxbHNs5660RiA6TrF0OFcg2unyS/qNcx7n0K4KNVyJxJPcnrJLcBQ5qfpFGEpjr2cS7y5dGKyv7spZ35G//xHYhdkmimbTHLD0Yh+LEil894ihGirLTkadU4vHQCB1x16I/g/Tu14TPe2Z47N3LlbWVcyL8BNbhAO5T+IPohaD4TJlZpv84BeRHYKafTPbLH3Z+6T3Qw/9Wh993lKFMr4HDbVo+tkr8Ty3lKEaBl7qvlV3xqUxQueqdaYqk36IZxAn30jQcpLXWOzqUAl1umlt4BxjsKUDyZqsiNP4OLC4oRYqN6KmwvLXfni94OgKtlo6PRaByCVU6zE/Zc/MZMtT/2t5YQFtjLcsSsD80aCGqFiwvXmYwqn1zoAwS4kdopFkLNBzQ1Q6xpNpXzsd7mYsc7VZLbfiVDX3Z3EMqXTmx4AhrtVp9jS4lMxJXJ60wcgPI8XItLw8WEqtdtFLCykz/5iWnHJboE4qYXirdWqUNpZ20+f2Om1xwKMFOPghjf+ruX0uV0gpHR67QNg3CmK/hFkZrvWk1JOaqfXXgBCp3gs+OYxQ+vHKeWqK+QtOb32AxBawtFIEKlVSlytrSg5l/4Nyzqx7u1QcgFVyvbtWtDvKx8BenDLxZSpFqA6hmTuYfb8O5v9D8BUYiZ+bx8AaWb9P6J91gPwX1pYnn19q6XBAAAAAElFTkSuQmCC"
                      alt=""
                    />
                  </div>
                </span>
              </span>
            </Card>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default memo(SettingSelectEnv);
