import { Document, Page, View } from '@react-pdf/renderer';
import { useAppTranslation } from '@hooks/index';
import { LANGUAGE_LIST } from '@constants/index';
import { S140Type } from '../shared/index.types';
import { Week } from '@definition/week_type';
import registerFonts from '@views/registerFonts';
import styles from './index.styles';
import S140Header from './S140Header';
import S140WeekTitle from './S140WeekTitle';
import S140PartMiniLabel from './S140PartMiniLabel';
import S140Person from './S140Person';
import S140WeekInfoLabel from './S140WeekInfoLabel';
import S140Time from './S140Time';
import S140SourceSimple from './S140SourceSimple';
import S140SourceExtended from './S140SourceExtended';
import S140MeetingPartHeading from './S140MeetingPartHeading';
import S140SourceComplex from './S140SourceComplex';
import S140AYF from './S140AYF';
import S140LC from './S140LC';

registerFonts();

const ScheduleS140 = ({ data, class_count, cong_name, lang }: S140Type) => {
  const { t } = useAppTranslation();

  const minLabel = t('tr_minLabel', { lng: lang });

  const font =
    LANGUAGE_LIST.find((record) => record.threeLettersCode === lang)?.font ||
    'Inter';

  return (
    <>
      {data.length > 0 && (
        <Document
          author="sws2apps"
          title={t('tr_midweekMeetingPrint')}
          creator="Organized"
          producer="sws2apps (by react-pdf)"
        >
          <Page size="A4" style={[styles.body, { fontFamily: font }]}>
            {/* S-140 Header */}
            <S140Header cong_name={cong_name} lang={lang} />

            {data.map((meetingData) => (
              <View
                key={`week-${meetingData.weekOf}`}
                style={styles.weekContainer}
                wrap={false}
              >
                <View style={styles.rowBase}>
                  <S140WeekTitle
                    title={meetingData.schedule_title}
                    lang={lang}
                  />
                  {!meetingData.no_meeting && (
                    <>
                      <S140PartMiniLabel
                        part={`${t('tr_chairman', { lng: lang })}:`}
                      />
                      <S140Person person={meetingData.chairman_A_name} />
                    </>
                  )}
                </View>
                <View
                  style={[
                    styles.rowBase,
                    { marginBottom: meetingData.aux_room_fsg ? '5px' : '10px' },
                  ]}
                >
                  <S140WeekInfoLabel weekLabel={meetingData.week_type_name} />
                  {!meetingData.no_meeting && meetingData.aux_class && (
                    <>
                      <S140PartMiniLabel
                        part={`${t('tr_auxClassCounselor', { lng: lang })}:`}
                      />
                      <S140Person person={meetingData.chairman_B_name} />
                    </>
                  )}
                </View>

                {!meetingData.no_meeting && (
                  <>
                    {meetingData.full && (
                      <>
                        {/* row field group in aux */}
                        {meetingData.aux_class && meetingData.aux_room_fsg && (
                          <View
                            style={[styles.rowBase, { marginBottom: '10px' }]}
                          >
                            <S140WeekInfoLabel weekLabel="" />
                            <S140PartMiniLabel
                              part={`${t('tr_assignedGroupAuxClassroom', { lng: lang })}:`}
                            />
                            <S140Person person={meetingData.aux_room_fsg} />
                          </View>
                        )}

                        {/* 3rd row for song, opening prayer */}
                        <View style={styles.rowBase}>
                          <S140Time time={meetingData.timing.pgm_start} />
                          <S140SourceSimple
                            source={meetingData.song_first}
                            bulletColor={'#2a6b77'}
                            lang={lang}
                          />
                          <S140PartMiniLabel
                            part={`${t('tr_prayer', { lng: lang })}:`}
                          />
                          <S140Person
                            person={meetingData.opening_prayer_name}
                          />
                        </View>

                        {/* 4th row for opening comments */}
                        <View style={styles.rowBase}>
                          <S140Time
                            time={meetingData.timing.opening_comments}
                          />
                          <S140SourceExtended
                            source={t('tr_openingComments', { lng: lang })}
                            time={`1 ${minLabel}`}
                            bulletColor={'#2a6b77'}
                            lang={lang}
                          />
                          <S140PartMiniLabel part="" />
                          <S140Person person="" />
                        </View>
                      </>
                    )}

                    {meetingData.week_type !== Week.ASSEMBLY &&
                      meetingData.week_type !== Week.CONVENTION && (
                        <>
                          {/* TGW, Classroom heading */}
                          {(meetingData.treasures || meetingData.students) && (
                            <>
                              <S140MeetingPartHeading
                                meetingPart={'tr_treasuresPart'}
                                backgroundColor={'#2a6b77'}
                                classroomHeading={true}
                                meetingData={meetingData}
                                class_count={class_count}
                                lang={lang}
                              />

                              {meetingData.treasures && (
                                <>
                                  {/* TGW Talk */}
                                  <View style={styles.rowBase}>
                                    <S140Time
                                      time={meetingData.timing.tgw_talk}
                                    />
                                    <S140SourceExtended
                                      source={meetingData.tgw_talk_src}
                                      time={meetingData.tgw_talk_time}
                                      bulletColor={'#2a6b77'}
                                      lang={lang}
                                    />
                                    <S140PartMiniLabel part="" />
                                    <S140Person
                                      person={meetingData.tgw_talk_name}
                                    />
                                  </View>

                                  {/* TGW Gems */}
                                  <View style={styles.rowBase}>
                                    <S140Time
                                      time={meetingData.timing.tgw_gems}
                                    />
                                    <S140SourceExtended
                                      source={meetingData.tgw_gems_src}
                                      time={meetingData.tgw_gems_time}
                                      bulletColor={'#2a6b77'}
                                      lang={lang}
                                    />
                                    <S140PartMiniLabel part="" />
                                    <S140Person
                                      person={meetingData.tgw_gems_name}
                                    />
                                  </View>
                                </>
                              )}

                              {meetingData.students && (
                                <>
                                  {/* Bible Reading */}
                                  <View style={styles.rowBase}>
                                    <S140Time
                                      time={
                                        meetingData.timing.tgw_bible_reading
                                      }
                                    />
                                    <S140SourceComplex
                                      source={meetingData.tgw_bible_reading_src}
                                      time={`4 ${minLabel}`}
                                      bulletColor={'#2a6b77'}
                                      partLabel={`${t('tr_student', { lng: lang })}:`}
                                      lang={lang}
                                    />
                                    <S140Person
                                      person={
                                        meetingData.aux_class
                                          ? meetingData.tgw_bible_reading_B_name
                                          : ''
                                      }
                                    />
                                    <S140Person
                                      person={
                                        meetingData.tgw_bible_reading_A_name
                                      }
                                    />
                                  </View>

                                  {/* AYF Heading */}
                                  <S140MeetingPartHeading
                                    meetingPart={'tr_applyFieldMinistryPart'}
                                    backgroundColor={'#a56803'}
                                    classroomHeading={true}
                                    meetingData={meetingData}
                                    class_count={class_count}
                                    lang={lang}
                                  />

                                  {/* AYF Parts */}
                                  <S140AYF
                                    meetingData={meetingData}
                                    class_count={class_count}
                                    lang={lang}
                                  />
                                </>
                              )}
                            </>
                          )}

                          {meetingData.living && (
                            <>
                              {/* LC Heading */}
                              <S140MeetingPartHeading
                                meetingPart={'tr_livingPart'}
                                backgroundColor={'#942926'}
                                classroomHeading={false}
                                meetingData={meetingData}
                                class_count={class_count}
                                lang={lang}
                              />

                              {meetingData.full && (
                                <>
                                  {/* Middle Song */}
                                  <View style={styles.rowBase}>
                                    <S140Time
                                      time={meetingData.timing.lc_middle_song}
                                    />
                                    <S140SourceSimple
                                      source={meetingData.lc_middle_song}
                                      bulletColor="#942926"
                                      lang={lang}
                                    />
                                    <S140PartMiniLabel part="" />
                                    <S140Person person="" />
                                  </View>
                                </>
                              )}

                              {/* LC Parts */}
                              <S140LC meetingData={meetingData} lang={lang} />

                              {/* When CO visits: Concluding Comments */}
                              {meetingData.week_type === Week.CO_VISIT && (
                                <>
                                  {/* Concluding Comments */}
                                  <View style={styles.rowBase}>
                                    <S140Time
                                      time={
                                        meetingData.timing.concluding_comments
                                      }
                                    />
                                    <S140SourceExtended
                                      source={t('tr_concludingComments', {
                                        lng: lang,
                                      })}
                                      time={`3 ${minLabel}`}
                                      bulletColor="#942926"
                                      lang={lang}
                                    />
                                    <S140PartMiniLabel part="" />
                                    <S140Person
                                      person={meetingData.chairman_A_name}
                                    />
                                  </View>

                                  {/* Talk by CO */}
                                  <View style={styles.rowBase}>
                                    <S140Time
                                      time={meetingData.timing.co_talk}
                                    />
                                    <S140SourceExtended
                                      source={meetingData.lc_co_talk}
                                      time={`30 ${minLabel}`}
                                      bulletColor="#942926"
                                      lang={lang}
                                    />
                                    <S140PartMiniLabel part="" />
                                    <S140Person person={meetingData.co_name} />
                                  </View>
                                </>
                              )}

                              {/* Normal Week */}
                              {meetingData.cbs && (
                                <>
                                  {/* CBS */}
                                  <View
                                    style={{
                                      ...styles.rowBase,
                                      marginBottom: '3px',
                                    }}
                                  >
                                    <S140Time time={meetingData.timing.cbs} />
                                    <S140SourceExtended
                                      source={meetingData.lc_cbs_title}
                                      time={meetingData.lc_cbs_time}
                                      bulletColor="#942926"
                                      lang={lang}
                                    />
                                    <S140PartMiniLabel
                                      part={meetingData.lc_cbs_label}
                                    />
                                    <S140Person
                                      person={meetingData.lc_cbs_name}
                                    />
                                  </View>

                                  {/* Concluding Comments */}
                                  {meetingData.full && (
                                    <View style={styles.rowBase}>
                                      <S140Time
                                        time={
                                          meetingData.timing.concluding_comments
                                        }
                                      />
                                      <S140SourceExtended
                                        source={t('tr_concludingComments', {
                                          lng: lang,
                                        })}
                                        time={`3 ${minLabel}`}
                                        bulletColor="#942926"
                                        lang={lang}
                                      />
                                      <S140PartMiniLabel part="" />
                                      <S140Person
                                        person={meetingData.chairman_A_name}
                                      />
                                    </View>
                                  )}
                                </>
                              )}

                              {/* Concluding Song, Prayer */}
                              {meetingData.full && (
                                <View style={styles.rowBase}>
                                  <S140Time time={meetingData.timing.pgm_end} />
                                  <S140SourceSimple
                                    source={meetingData.lc_concluding_song}
                                    bulletColor="#942926"
                                    lang={lang}
                                  />
                                  <S140PartMiniLabel
                                    part={`${t('tr_prayer', { lng: lang })}:`}
                                  />
                                  <S140Person
                                    person={meetingData.lc_concluding_prayer}
                                  />
                                </View>
                              )}
                            </>
                          )}
                        </>
                      )}
                  </>
                )}
              </View>
            ))}
          </Page>
        </Document>
      )}
    </>
  );
};

export default ScheduleS140;
