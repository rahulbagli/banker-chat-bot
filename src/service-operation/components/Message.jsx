import { useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LoadingProcess from '../components/LoadingProcess';
import TypewriterResponse from '../components/TypewriterResponse';
import { handleDownload } from '../../service-operation/api/downloadUtils';
import '../css/AdvancedChatBot.scss';

export default function Message({ message }) {
  if (message.type === 'loading') {
    return (
      <div className="message bot">
        <LoadingProcess />
      </div>
    );
  }

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message.responseText]);


  if (message.fileName) {
    return (
      <div className={`message ${message.type}`}>
        <div className="file-card">
          <div className="file-info">
              <div className="file-text">{message.responseText} service</div>
          </div>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            className="download-btn"
            onClick={() =>
              handleDownload({
                fileName: message.fileName,
                queryIntent: message.queryIntent,
              })
            }
          >
            Download
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${message.type}`}>
      <TypewriterResponse response={message.responseText} />
       <div ref={bottomRef} />
    </div>
  );
}
