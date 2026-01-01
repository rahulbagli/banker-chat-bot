import { useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LoadingProcess from '../components/LoadingProcess';
import TypewriterResponse from '../components/TypewriterResponse';
import { handleDownload } from '../../service-operation/api/downloadUtils';
import '../css/AdvancedChatBot.scss';

export default function Message({ message }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  if (message.type === 'loading') {
    return (
      <div className="message bot">
        <LoadingProcess />
        <div ref={bottomRef} />
      </div>
    );
  }

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
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className={`message ${message.type}`}>
      {message.type === 'bot' ? (
        <TypewriterResponse response={message.responseText} />
      ) : (
        <div className="user-text">{message.responseText}</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}