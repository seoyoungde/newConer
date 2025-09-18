import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../lib/firebase";
import Button from "../../components/ui/Button";
import { FaStar, FaCamera, FaTimes } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import Modal from "../../components/common/Modal/Modal";

// 상수들
const MAX_RATING = 5;
const MAX_PHOTOS = 10;
const STAR_SIZE = 40;
const STAR_COLOR = "#C2E1FF";

const SNS_OPTIONS = [
  "페이스북",
  "인스타그램",
  "카페",
  "트위터",
  "유튜브",
  "카카오톡",
  "블로그",
  "쓰레드",
];

const ReviewPage = () => {
  const [ratings, setRatings] = useState({
    partner: 0,
    service: 0,
  });
  const [selectedSns, setSelectedSns] = useState(new Set());
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [serviceOpinion, setServiceOpinion] = useState("");
  const [complaints, setComplaints] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { requestId } = useParams(); // URL에서 의뢰서 ID 가져오기
  const navigate = useNavigate();

  const [popupMessage, setPopupMessage] = useState("");

  // 사진을 Firebase Storage에 업로드하고 URL 반환
  const uploadPhotosToStorage = async (photos) => {
    const uploadPromises = photos.map(async (photo, index) => {
      const fileName = `reviews/${requestId}/photo_${Date.now()}_${index}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, photo.file);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  //날짜 형식변환
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  };

  // 리뷰 제출 함수
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!requestId) {
      setPopupMessage("의뢰서가 없습니다.");
      return;
    }

    if (ratings.partner === 0 || ratings.service === 0) {
      setPopupMessage("평점을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 사진들을 Firebase Storage에 업로드
      let photoUrls = [];
      if (uploadedPhotos.length > 0) {
        photoUrls = await uploadPhotosToStorage(uploadedPhotos);
      }

      // Firestore에 저장할 데이터 구성
      const reviewData = {
        complaints: complaints,
        partner_rating: ratings.partner.toString(),
        photo: photoUrls,
        serviceOpinion: serviceOpinion,
        service_rating: ratings.service.toString(),
        sns: Array.from(selectedSns),
        createdAt: formatDate(new Date()),
      };

      // Firestore의 Review 컬렉션에 저장 (문서 ID는 requestId)
      await setDoc(doc(db, "Review", requestId), reviewData);

      setPopupMessage("감사합니다. 소중한 후기가 등록되었습니다");
    } catch (error) {
      alert("리뷰 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (popupMessage.includes("감사합니다")) {
      navigate("/");
    } else {
      setPopupMessage("");
    }
  };

  const handlePhotoButtonClick = () => {
    if (uploadedPhotos.length < MAX_PHOTOS) {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // 현재 업로드된 사진 수와 새로 선택한 파일 수를 합쳐서 최대 개수 확인
    const remainingSlots = MAX_PHOTOS - uploadedPhotos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // 파일을 미리보기용 URL로 변환
    const newPhotos = filesToAdd.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);

    // input 값 초기화 (같은 파일을 다시 선택할 수 있도록)
    event.target.value = "";
  };

  // 사진 삭제 함수
  const removePhoto = (photoId) => {
    setUploadedPhotos((prev) => {
      const photoToRemove = prev.find((photo) => photo.id === photoId);
      if (photoToRemove) {
        // 메모리 누수 방지를 위해 URL 해제
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  // 평점 업데이트 함수
  const updateRating = (type, value) => {
    setRatings((prev) => ({ ...prev, [type]: value }));
  };

  // SNS 체크박스 토글
  const toggleSns = (sns) => {
    setSelectedSns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sns)) {
        newSet.delete(sns);
      } else {
        newSet.add(sns);
      }
      return newSet;
    });
  };

  // 별점 컴포넌트
  const StarRating = ({ rating, onRatingChange, label }) => (
    <RatingSection>
      <RatingLabel>{label}</RatingLabel>
      <StarContainer>
        {Array.from({ length: MAX_RATING }, (_, index) => {
          const starValue = index + 1;
          return (
            <StarButton
              key={starValue}
              onClick={() => onRatingChange(starValue)}
              aria-label={`${starValue}점`}
            >
              {starValue <= rating ? (
                <FaStar size={STAR_SIZE} color={STAR_COLOR} />
              ) : (
                <CiStar size={STAR_SIZE} color="gray" />
              )}
            </StarButton>
          );
        })}
      </StarContainer>
    </RatingSection>
  );

  // 체크박스 컴포넌트
  const CheckboxItem = ({ label, checked, onChange }) => (
    <CheckboxWrapper>
      <Checkbox
        checked={checked}
        onClick={() => onChange(label)}
        aria-label={label}
      />
      <CheckboxLabel>{label}</CheckboxLabel>
    </CheckboxWrapper>
  );

  return (
    <Container>
      <PageHeader>코너 서비스를 이용하셨나요?</PageHeader>
      <Divider />

      <ReviewForm onSubmit={handleSubmitReview}>
        <RatingsContainer>
          <StarRating
            rating={ratings.partner}
            onRatingChange={(value) => updateRating("partner", value)}
            label="업체 평점을 남겨주세요"
          />

          <StarRating
            rating={ratings.service}
            onRatingChange={(value) => updateRating("service", value)}
            label="코너 웹서비스 평점을 남겨주세요"
          />
        </RatingsContainer>

        <TextAreaWrapper>
          <TextAreaLabel>
            서비스에 대한 의견을 나눠주세요 (칭찬도 좋아요)
          </TextAreaLabel>
          <StyledTextArea
            placeholder="소중한 의견은 코너 운영팀에게 전달됩니다"
            rows={4}
            value={serviceOpinion}
            onChange={(e) => setServiceOpinion(e.target.value)}
          />
        </TextAreaWrapper>

        <PhotoUploadSection>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            multiple
            onChange={handleFileUpload}
          />

          <PhotoUploadButton
            onClick={handlePhotoButtonClick}
            disabled={uploadedPhotos.length >= MAX_PHOTOS}
          >
            <FaCamera
              size={33}
              color={uploadedPhotos.length >= MAX_PHOTOS ? "#ccc" : "#666"}
            />
            <PhotoCount>
              {uploadedPhotos.length}/{MAX_PHOTOS}
            </PhotoCount>
            <PhotoUploadText>
              {uploadedPhotos.length >= MAX_PHOTOS
                ? "최대 업로드 완료"
                : "사진을 추가해 보세요!"}
            </PhotoUploadText>
          </PhotoUploadButton>

          {/* 업로드된 사진들 미리보기 */}
          {uploadedPhotos.length > 0 && (
            <PhotoPreviewContainer>
              {uploadedPhotos.map((photo) => (
                <PhotoPreviewItem key={photo.id}>
                  <PhotoPreview src={photo.preview} alt={photo.name} />
                  <RemoveButton onClick={() => removePhoto(photo.id)}>
                    <FaTimes size={12} />
                  </RemoveButton>
                </PhotoPreviewItem>
              ))}
            </PhotoPreviewContainer>
          )}
        </PhotoUploadSection>

        <TextAreaWrapper>
          <TextAreaLabel>기타 불편사항이 있으면 적어주세요</TextAreaLabel>
          <StyledTextArea
            placeholder="소중한 의견은 코너 운영팀에게 전달됩니다"
            rows={4}
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
          />
        </TextAreaWrapper>

        <SnsSection>
          <SectionLabel>현재 이용중인 sns를 모두 선택해주세요</SectionLabel>
          <CheckboxGrid>
            {SNS_OPTIONS.map((sns) => (
              <CheckboxItem
                key={sns}
                label={sns}
                checked={selectedSns.has(sns)}
                onChange={toggleSns}
              />
            ))}
          </CheckboxGrid>
        </SnsSection>

        <Button
          fullWidth
          size="md"
          type="submit"
          disabled={
            isSubmitting || ratings.partner === 0 || ratings.service === 0
          }
        >
          {isSubmitting ? "저장 중..." : "후기 작성 완료"}
        </Button>
      </ReviewForm>
      <Modal
        open={!!popupMessage}
        onClose={handleModalClose}
        width={320}
        containerId="rightbox-modal-root"
      >
        {popupMessage}
      </Modal>
    </Container>
  );
};

export default ReviewPage;

const Container = styled.section``;

const PageHeader = styled.header`
  text-align: center;
  margin: 20px;
  font-weight: bold;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: #e0e0e0;
`;

const ReviewForm = styled.form`
  width: 100%;
  padding: 20px 0;
`;

const RatingsContainer = styled.div`
  text-align: center;
  padding: 15px 0;
`;

const RatingSection = styled.div`
  margin-bottom: 20px;
`;

const RatingLabel = styled.p`
  font-weight: 600;
`;

const StarContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid ${STAR_COLOR};
    border-radius: 4px;
  }
`;

const PhotoUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
  gap: 15px;
`;

const PhotoUploadButton = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s ease;
  gap: 8px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  align-self: flex-start;

  &:hover {
    background-color: ${(props) =>
      props.disabled ? "transparent" : "#f5f5f5"};
  }
`;

const PhotoCount = styled.p`
  font-size: 12px;
  margin: 0;
  color: #666;
`;

const PhotoUploadText = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  text-align: center;
  line-height: 1.2;
`;

const PhotoPreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const PhotoPreviewItem = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const PhotoPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const SnsSection = styled.div`
  margin: 30px 0;
`;

const SectionLabel = styled.p`
  font-size: ${({ theme }) => theme.font?.size?.bodySmall || "14px"};
  font-weight: 600;
  margin-bottom: 15px;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${(props) => (props.checked ? STAR_COLOR : "#ccc")};
  background-color: ${(props) => (props.checked ? STAR_COLOR : "transparent")};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${STAR_COLOR};
  }

  ${(props) =>
    props.checked &&
    `
    &::after {
      content: '✓';
      position: absolute;
      top: -6px;
      left: 1.5px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
  `}
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  cursor: pointer;
  user-select: none;
`;

const TextAreaWrapper = styled.div`
  margin: 20px 0;
`;

const TextAreaLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  &:focus {
    outline: none;
    border-color: ${STAR_COLOR};
    box-shadow: 0 0 0 2px ${STAR_COLOR}20;
  }

  &::placeholder {
    color: #999;
  }
`;
