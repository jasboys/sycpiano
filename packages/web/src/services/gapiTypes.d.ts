namespace Youtube {
    export interface ContentRating {
        /*
         * The video's Australian Classification Board (ACB) or Australian Communications and Media Authority (ACMA) rating. ACMA ratings are used to classify
         * children's television programming.
         */
        acbRating?: string;
        /* The video's rating from Italy's Autorità per le Garanzie nelle Comunicazioni (AGCOM). */
        agcomRating?: string;
        /* The video's Anatel (Asociación Nacional de Televisión) rating for Chilean television. */
        anatelRating?: string;
        /* The video's British Board of Film Classification (BBFC) rating. */
        bbfcRating?: string;
        /* The video's rating from Thailand's Board of Film and Video Censors. */
        bfvcRating?: string;
        /* The video's rating from the Austrian Board of Media Classification (Bundesministerium für Unterricht, Kunst und Kultur). */
        bmukkRating?: string;
        /*
         * Rating system for Canadian TV - Canadian TV Classification System The video's rating from the Canadian Radio-Television and Telecommunications
         * Commission (CRTC) for Canadian English-language broadcasts. For more information, see the Canadian Broadcast Standards Council website.
         */
        catvRating?: string;
        /*
         * The video's rating from the Canadian Radio-Television and Telecommunications Commission (CRTC) for Canadian French-language broadcasts. For more
         * information, see the Canadian Broadcast Standards Council website.
         */
        catvfrRating?: string;
        /* The video's Central Board of Film Certification (CBFC - India) rating. */
        cbfcRating?: string;
        /* The video's Consejo de Calificación Cinematográfica (Chile) rating. */
        cccRating?: string;
        /* The video's rating from Portugal's Comissão de Classificação de Espect´culos. */
        cceRating?: string;
        /* The video's rating in Switzerland. */
        chfilmRating?: string;
        /* The video's Canadian Home Video Rating System (CHVRS) rating. */
        chvrsRating?: string;
        /* The video's rating from the Commission de Contrôle des Films (Belgium). */
        cicfRating?: string;
        /* The video's rating from Romania's CONSILIUL NATIONAL AL AUDIOVIZUALULUI (CNA). */
        cnaRating?: string;
        /* Rating system in France - Commission de classification cinematographique */
        cncRating?: string;
        /* The video's rating from France's Conseil supérieur de l?audiovisuel, which rates broadcast content. */
        csaRating?: string;
        /* The video's rating from Luxembourg's Commission de surveillance de la classification des films (CSCF). */
        cscfRating?: string;
        /* The video's rating in the Czech Republic. */
        czfilmRating?: string;
        /* The video's Departamento de Justiça, Classificação, Qualificação e Títulos (DJCQT - Brazil) rating. */
        djctqRating?: string;
        /* Reasons that explain why the video received its DJCQT (Brazil) rating. */
        djctqRatingReasons?: string[];
        /* Rating system in Turkey - Evaluation and Classification Board of the Ministry of Culture and Tourism */
        ecbmctRating?: string;
        /* The video's rating in Estonia. */
        eefilmRating?: string;
        /* The video's rating in Egypt. */
        egfilmRating?: string;
        /* The video's Eirin (映倫) rating. Eirin is the Japanese rating system. */
        eirinRating?: string;
        /* The video's rating from Malaysia's Film Censorship Board. */
        fcbmRating?: string;
        /* The video's rating from Hong Kong's Office for Film, Newspaper and Article Administration. */
        fcoRating?: string;
        /* This property has been deprecated. Use the contentDetails.contentRating.cncRating instead. */
        fmocRating?: string;
        /* The video's rating from South Africa's Film and Publication Board. */
        fpbRating?: string;
        /* Reasons that explain why the video received its FPB (South Africa) rating. */
        fpbRatingReasons?: string[];
        /* The video's Freiwillige Selbstkontrolle der Filmwirtschaft (FSK - Germany) rating. */
        fskRating?: string;
        /* The video's rating in Greece. */
        grfilmRating?: string;
        /* The video's Instituto de la Cinematografía y de las Artes Audiovisuales (ICAA - Spain) rating. */
        icaaRating?: string;
        /* The video's Irish Film Classification Office (IFCO - Ireland) rating. See the IFCO website for more information. */
        ifcoRating?: string;
        /* The video's rating in Israel. */
        ilfilmRating?: string;
        /* The video's INCAA (Instituto Nacional de Cine y Artes Audiovisuales - Argentina) rating. */
        incaaRating?: string;
        /* The video's rating from the Kenya Film Classification Board. */
        kfcbRating?: string;
        /* voor de Classificatie van Audiovisuele Media (Netherlands). */
        kijkwijzerRating?: string;
        /* The video's Korea Media Rating Board (영상물등급위원회) rating. The KMRB rates videos in South Korea. */
        kmrbRating?: string;
        /* The video's rating from Indonesia's Lembaga Sensor Film. */
        lsfRating?: string;
        /* The video's rating from Malta's Film Age-Classification Board. */
        mccaaRating?: string;
        /* The video's rating from the Danish Film Institute's (Det Danske Filminstitut) Media Council for Children and Young People. */
        mccypRating?: string;
        /* The video's rating system for Vietnam - MCST */
        mcstRating?: string;
        /* The video's rating from Singapore's Media Development Authority (MDA) and, specifically, it's Board of Film Censors (BFC). */
        mdaRating?: string;
        /* The video's rating from Medietilsynet, the Norwegian Media Authority. */
        medietilsynetRating?: string;
        /* The video's rating from Finland's Kansallinen Audiovisuaalinen Instituutti (National Audiovisual Institute). */
        mekuRating?: string;
        /* The rating system for MENA countries, a clone of MPAA. It is needed to */
        menaMpaaRating?: string;
        /* The video's rating from the Ministero dei Beni e delle Attività Culturali e del Turismo (Italy). */
        mibacRating?: string;
        /* The video's Ministerio de Cultura (Colombia) rating. */
        mocRating?: string;
        /* The video's rating from Taiwan's Ministry of Culture (文化部). */
        moctwRating?: string;
        /* The video's Motion Picture Association of America (MPAA) rating. */
        mpaaRating?: string;
        /* The rating system for trailer, DVD, and Ad in the US. See http://movielabs.com/md/ratings/v2.3/html/US_MPAAT_Ratings.html. */
        mpaatRating?: string;
        /* The video's rating from the Movie and Television Review and Classification Board (Philippines). */
        mtrcbRating?: string;
        /* The video's rating from the Maldives National Bureau of Classification. */
        nbcRating?: string;
        /* The video's rating in Poland. */
        nbcplRating?: string;
        /* The video's rating from the Bulgarian National Film Center. */
        nfrcRating?: string;
        /* The video's rating from Nigeria's National Film and Video Censors Board. */
        nfvcbRating?: string;
        /* The video's rating from the Nacionãlais Kino centrs (National Film Centre of Latvia). */
        nkclvRating?: string;
        /* The video's Office of Film and Literature Classification (OFLC - New Zealand) rating. */
        oflcRating?: string;
        /* The video's rating in Peru. */
        pefilmRating?: string;
        /* The video's rating from the Hungarian Nemzeti Filmiroda, the Rating Committee of the National Office of Film. */
        rcnofRating?: string;
        /* The video's rating in Venezuela. */
        resorteviolenciaRating?: string;
        /* The video's General Directorate of Radio, Television and Cinematography (Mexico) rating. */
        rtcRating?: string;
        /* The video's rating from Ireland's Raidió Teilifís Éireann. */
        rteRating?: string;
        /* The video's National Film Registry of the Russian Federation (MKRF - Russia) rating. */
        russiaRating?: string;
        /* The video's rating in Slovakia. */
        skfilmRating?: string;
        /* The video's rating in Iceland. */
        smaisRating?: string;
        /* The video's rating from Statens medieråd (Sweden's National Media Council). */
        smsaRating?: string;
        /* The video's TV Parental Guidelines (TVPG) rating. */
        tvpgRating?: string;
        /* A rating that YouTube uses to identify age-restricted content. */
        ytRating?: string;
    }

    export interface PlaylistItem {
        /*
         * The contentDetails object is included in the resource if the included item is a YouTube video. The object contains additional information about the
         * video.
         */
        contentDetails?: PlaylistItemContentDetails;
        /* Etag of this resource. */
        etag?: string;
        /* The ID that YouTube uses to uniquely identify the playlist item. */
        id?: string;
        /* Identifies what kind of resource this is. Value: the fixed string "youtube#playlistItem". */
        kind?: string;
        /* The snippet object contains basic details about the playlist item, such as its title and position in the playlist. */
        snippet?: PlaylistItemSnippet;
        /* The status object contains information about the playlist item's privacy status. */
        status?: PlaylistItemStatus;
    }

    export interface PlaylistItemStatus {
        /* This resource's privacy status. */
        privacyStatus?: string;
    }

    export interface PlaylistItemSnippet {
        /* The ID that YouTube uses to uniquely identify the user that added the item to the playlist. */
        channelId?: string;
        /* Channel title for the channel that the playlist item belongs to. */
        channelTitle?: string;
        /* The item's description. */
        description?: string;
        /* The ID that YouTube uses to uniquely identify the playlist that the playlist item is in. */
        playlistId?: string;
        /*
         * The order in which the item appears in the playlist. The value uses a zero-based index, so the first item has a position of 0, the second item has a
         * position of 1, and so forth.
         */
        position?: number;
        /* The date and time that the item was added to the playlist. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. */
        publishedAt?: string;
        /* The id object contains information that can be used to uniquely identify the resource that is included in the playlist as the playlist item. */
        resourceId?: ResourceId;
        /*
         * A map of thumbnail images associated with the playlist item. For each object in the map, the key is the name of the thumbnail image, and the value is
         * an object that contains other information about the thumbnail.
         */
        thumbnails?: ThumbnailDetails;
        /* The item's title. */
        title?: string;
    }

    export interface PlaylistItemContentDetails {
        /*
         * The time, measured in seconds from the start of the video, when the video should stop playing. (The playlist owner can specify the times when the video
         * should start and stop playing when the video is played in the context of the playlist.) By default, assume that the video.endTime is the end of the
         * video.
         */
        endAt?: string;
        /* A user-generated note for this item. */
        note?: string;
        /*
         * The time, measured in seconds from the start of the video, when the video should start playing. (The playlist owner can specify the times when the
         * video should start and stop playing when the video is played in the context of the playlist.) The default value is 0.
         */
        startAt?: string;
        /* The ID that YouTube uses to uniquely identify a video. To retrieve the video resource, set the id query parameter to this value in your API request. */
        videoId?: string;
        /* The date and time that the video was published to YouTube. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. */
        videoPublishedAt?: string;
    }

    export interface TokenPagination {
        etag?: string;
    }

    export interface PlaylistItemListResponse {
        /* Etag of this resource. */
        etag?: string;
        /* Serialized EventId of the request which produced this response. */
        eventId?: string;
        /* A list of playlist items that match the request criteria. */
        items?: PlaylistItem[];
        /* Identifies what kind of resource this is. Value: the fixed string "youtube#playlistItemListResponse". */
        kind?: string;
        /* The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set. */
        nextPageToken?: string;
        pageInfo?: PageInfo;
        /* The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set. */
        prevPageToken?: string;
        tokenPagination?: TokenPagination;
        /* The visitorId identifies the visitor. */
        visitorId?: string;
    }

    export interface ResourceId {
        /*
         * The ID that YouTube uses to uniquely identify the referred resource, if that resource is a channel. This property is only present if the
         * resourceId.kind value is youtube#channel.
         */
        channelId?: string;
        /* The type of the API resource. */
        kind?: string;
        /*
         * The ID that YouTube uses to uniquely identify the referred resource, if that resource is a playlist. This property is only present if the
         * resourceId.kind value is youtube#playlist.
         */
        playlistId?: string;
        /*
         * The ID that YouTube uses to uniquely identify the referred resource, if that resource is a video. This property is only present if the resourceId.kind
         * value is youtube#video.
         */
        videoId?: string;
    }

    export interface Thumbnail {
        /* (Optional) Height of the thumbnail image. */
        height?: number;
        /* The thumbnail image's URL. */
        url?: string;
        /* (Optional) Width of the thumbnail image. */
        width?: number;
    }

    export interface ThumbnailDetails {
        /* The default image for this resource. */
        default?: Thumbnail;
        /* The high quality image for this resource. */
        high?: Thumbnail;
        /* The maximum resolution quality image for this resource. */
        maxres?: Thumbnail;
        /* The medium quality image for this resource. */
        medium?: Thumbnail;
        /* The standard quality image for this resource. */
        standard?: Thumbnail;
    }

    export interface PageInfo {
        /* The number of results included in the API response. */
        resultsPerPage?: number;
        /* The total number of results in the result set. */
        totalResults?: number;
    }

    export interface VideoListResponse {
        /* Etag of this resource. */
        etag?: string;
        /* Serialized EventId of the request which produced this response. */
        eventId?: string;
        /* A list of videos that match the request criteria. */
        items?: Video[];
        /* Identifies what kind of resource this is. Value: the fixed string "youtube#videoListResponse". */
        kind?: string;
        /* The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set. */
        nextPageToken?: string;
        pageInfo?: PageInfo;
        /* The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set. */
        prevPageToken?: string;
        tokenPagination?: TokenPagination;
        /* The visitorId identifies the visitor. */
        visitorId?: string;
    }

    export interface Video {
        /* Age restriction details related to a video. This data can only be retrieved by the video owner. */
        ageGating?: VideoAgeGating;
        /* The contentDetails object contains information about the video content, including the length of the video and its aspect ratio. */
        contentDetails?: VideoContentDetails;
        /* Etag of this resource. */
        etag?: string;
        /*
         * The fileDetails object encapsulates information about the video file that was uploaded to YouTube, including the file's resolution, duration, audio and
         * video codecs, stream bitrates, and more. This data can only be retrieved by the video owner.
         */
        fileDetails?: VideoFileDetails;
        /* The ID that YouTube uses to uniquely identify the video. */
        id?: string;
        /* Identifies what kind of resource this is. Value: the fixed string "youtube#video". */
        kind?: string;
        /*
         * The liveStreamingDetails object contains metadata about a live video broadcast. The object will only be present in a video resource if the video is an
         * upcoming, live, or completed live broadcast.
         */
        liveStreamingDetails?: VideoLiveStreamingDetails;
        /* List with all localizations. */
        localizations?: Record<string, VideoLocalization>;
        /* The monetizationDetails object encapsulates information about the monetization status of the video. */
        monetizationDetails?: VideoMonetizationDetails;
        /* The player object contains information that you would use to play the video in an embedded player. */
        player?: VideoPlayer;
        /*
         * The processingProgress object encapsulates information about YouTube's progress in processing the uploaded video file. The properties in the object
         * identify the current processing status and an estimate of the time remaining until YouTube finishes processing the video. This part also indicates
         * whether different types of data or content, such as file details or thumbnail images, are available for the video.
         *
         * The processingProgress object is designed to be polled so that the video uploaded can track the progress that YouTube has made in processing the
         * uploaded video file. This data can only be retrieved by the video owner.
         */
        processingDetails?: VideoProcessingDetails;
        /* The projectDetails object contains information about the project specific video metadata. */
        projectDetails?: VideoProjectDetails;
        /* The recordingDetails object encapsulates information about the location, date and address where the video was recorded. */
        recordingDetails?: VideoRecordingDetails;
        /* The snippet object contains basic details about the video, such as its title, description, and category. */
        snippet?: VideoSnippet;
        /* The statistics object contains statistics about the video. */
        statistics?: VideoStatistics;
        /* The status object contains information about the video's uploading, processing, and privacy statuses. */
        status?: VideoStatus;
        /*
         * The suggestions object encapsulates suggestions that identify opportunities to improve the video quality or the metadata for the uploaded video. This
         * data can only be retrieved by the video owner.
         */
        suggestions?: VideoSuggestions;
        /* The topicDetails object encapsulates information about Freebase topics associated with the video. */
        topicDetails?: VideoTopicDetails;
    }

    export interface VideoAgeGating {
        /*
         * Indicates whether or not the video has alcoholic beverage content. Only users of legal purchasing age in a particular country, as identified by ICAP,
         * can view the content.
         */
        alcoholContent?: boolean;
        /*
         * Age-restricted trailers. For redband trailers and adult-rated video-games. Only users aged 18+ can view the content. The the field is true the content
         * is restricted to viewers aged 18+. Otherwise The field won't be present.
         */
        restricted?: boolean;
        /* Video game rating, if any. */
        videoGameRating?: string;
    }

    export interface VideoContentDetails {
        /* The value of captions indicates whether the video has captions or not. */
        caption?: string;
        /* Specifies the ratings that the video received under various rating schemes. */
        contentRating?: ContentRating;
        /* The countryRestriction object contains information about the countries where a video is (or is not) viewable. */
        countryRestriction?: AccessPolicy;
        /* The value of definition indicates whether the video is available in high definition or only in standard definition. */
        definition?: string;
        /* The value of dimension indicates whether the video is available in 3D or in 2D. */
        dimension?: string;
        /*
         * The length of the video. The tag value is an ISO 8601 duration in the format PT#M#S, in which the letters PT indicate that the value specifies a period
         * of time, and the letters M and S refer to length in minutes and seconds, respectively. The # characters preceding the M and S letters are both integers
         * that specify the number of minutes (or seconds) of the video. For example, a value of PT15M51S indicates that the video is 15 minutes and 51 seconds
         * long.
         */
        duration?: string;
        /* Indicates whether the video uploader has provided a custom thumbnail image for the video. This property is only visible to the video uploader. */
        hasCustomThumbnail?: boolean;
        /* The value of is_license_content indicates whether the video is licensed content. */
        licensedContent?: boolean;
        /* Specifies the projection format of the video. */
        projection?: string;
        /*
         * The regionRestriction object contains information about the countries where a video is (or is not) viewable. The object will contain either the
         * contentDetails.regionRestriction.allowed property or the contentDetails.regionRestriction.blocked property.
         */
        regionRestriction?: VideoContentDetailsRegionRestriction;
    }
    export interface VideoContentDetailsRegionRestriction {
        /*
         * A list of region codes that identify countries where the video is viewable. If this property is present and a country is not listed in its value, then
         * the video is blocked from appearing in that country. If this property is present and contains an empty list, the video is blocked in all countries.
         */
        allowed?: string[];
        /*
         * A list of region codes that identify countries where the video is blocked. If this property is present and a country is not listed in its value, then
         * the video is viewable in that country. If this property is present and contains an empty list, the video is viewable in all countries.
         */
        blocked?: string[];
    }
    export interface VideoFileDetails {
        /* A list of audio streams contained in the uploaded video file. Each item in the list contains detailed metadata about an audio stream. */
        audioStreams?: VideoFileDetailsAudioStream[];
        /* The uploaded video file's combined (video and audio) bitrate in bits per second. */
        bitrateBps?: string;
        /* The uploaded video file's container format. */
        container?: string;
        /*
         * The date and time when the uploaded video file was created. The value is specified in ISO 8601 format. Currently, the following ISO 8601 formats are
         * supported:
         * - Date only: YYYY-MM-DD
         * - Naive time: YYYY-MM-DDTHH:MM:SS
         * - Time with timezone: YYYY-MM-DDTHH:MM:SS+HH:MM
         */
        creationTime?: string;
        /* The length of the uploaded video in milliseconds. */
        durationMs?: string;
        /* The uploaded file's name. This field is present whether a video file or another type of file was uploaded. */
        fileName?: string;
        /* The uploaded file's size in bytes. This field is present whether a video file or another type of file was uploaded. */
        fileSize?: string;
        /*
         * The uploaded file's type as detected by YouTube's video processing engine. Currently, YouTube only processes video files, but this field is present
         * whether a video file or another type of file was uploaded.
         */
        fileType?: string;
        /* A list of video streams contained in the uploaded video file. Each item in the list contains detailed metadata about a video stream. */
        videoStreams?: VideoFileDetailsVideoStream[];
    }

    export interface VideoFileDetailsAudioStream {
        /* The audio stream's bitrate, in bits per second. */
        bitrateBps?: string;
        /* The number of audio channels that the stream contains. */
        channelCount?: number;
        /* The audio codec that the stream uses. */
        codec?: string;
        /* A value that uniquely identifies a video vendor. Typically, the value is a four-letter vendor code. */
        vendor?: string;
    }

    export interface VideoFileDetailsVideoStream {
        /* The video content's display aspect ratio, which specifies the aspect ratio in which the video should be displayed. */
        aspectRatio?: number;
        /* The video stream's bitrate, in bits per second. */
        bitrateBps?: string;
        /* The video codec that the stream uses. */
        codec?: string;
        /* The video stream's frame rate, in frames per second. */
        frameRateFps?: number;
        /* The encoded video content's height in pixels. */
        heightPixels?: number;
        /* The amount that YouTube needs to rotate the original source content to properly display the video. */
        rotation?: string;
        /* A value that uniquely identifies a video vendor. Typically, the value is a four-letter vendor code. */
        vendor?: string;
        /* The encoded video content's width in pixels. You can calculate the video's encoding aspect ratio as width_pixels / height_pixels. */
        widthPixels?: number;
    }

    export interface VideoLiveStreamingDetails {
        /*
         * The ID of the currently active live chat attached to this video. This field is filled only if the video is a currently live broadcast that has live
         * chat. Once the broadcast transitions to complete this field will be removed and the live chat closed down. For persistent broadcasts that live chat id
         * will no longer be tied to this video but rather to the new video being displayed at the persistent page.
         */
        activeLiveChatId?: string;
        /*
         * The time that the broadcast actually ended. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. This value will not be available until
         * the broadcast is over.
         */
        actualEndTime?: string;
        /*
         * The time that the broadcast actually started. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. This value will not be available
         * until the broadcast begins.
         */
        actualStartTime?: string;
        /*
         * The number of viewers currently watching the broadcast. The property and its value will be present if the broadcast has current viewers and the
         * broadcast owner has not hidden the viewcount for the video. Note that YouTube stops tracking the number of concurrent viewers for a broadcast when the
         * broadcast ends. So, this property would not identify the number of viewers watching an archived video of a live broadcast that already ended.
         */
        concurrentViewers?: string;
        /*
         * The time that the broadcast is scheduled to end. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. If the value is empty or the
         * property is not present, then the broadcast is scheduled to continue indefinitely.
         */
        scheduledEndTime?: string;
        /* The time that the broadcast is scheduled to begin. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. */
        scheduledStartTime?: string;
    }
    export interface VideoLocalization {
        /* Localized version of the video's description. */
        description?: string;
        /* Localized version of the video's title. */
        title?: string;
    }
    export interface VideoMonetizationDetails {
        /* The value of access indicates whether the video can be monetized or not. */
        access?: AccessPolicy;
    }
    export interface VideoPlayer {
        embedHeight?: string;
        /* An <iframe> tag that embeds a player that will play the video. */
        embedHtml?: string;
        /* The embed width */
        embedWidth?: string;
    }
    export interface VideoProcessingDetails {
        /*
         * This value indicates whether video editing suggestions, which might improve video quality or the playback experience, are available for the video. You
         * can retrieve these suggestions by requesting the suggestions part in your videos.list() request.
         */
        editorSuggestionsAvailability?: string;
        /*
         * This value indicates whether file details are available for the uploaded video. You can retrieve a video's file details by requesting the fileDetails
         * part in your videos.list() request.
         */
        fileDetailsAvailability?: string;
        /* The reason that YouTube failed to process the video. This property will only have a value if the processingStatus property's value is failed. */
        processingFailureReason?: string;
        /*
         * This value indicates whether the video processing engine has generated suggestions that might improve YouTube's ability to process the the video,
         * warnings that explain video processing problems, or errors that cause video processing problems. You can retrieve these suggestions by requesting the
         * suggestions part in your videos.list() request.
         */
        processingIssuesAvailability?: string;
        /*
         * The processingProgress object contains information about the progress YouTube has made in processing the video. The values are really only relevant if
         * the video's processing status is processing.
         */
        processingProgress?: VideoProcessingDetailsProcessingProgress;
        /* The video's processing status. This value indicates whether YouTube was able to process the video or if the video is still being processed. */
        processingStatus?: string;
        /*
         * This value indicates whether keyword (tag) suggestions are available for the video. Tags can be added to a video's metadata to make it easier for other
         * users to find the video. You can retrieve these suggestions by requesting the suggestions part in your videos.list() request.
         */
        tagSuggestionsAvailability?: string;
        /* This value indicates whether thumbnail images have been generated for the video. */
        thumbnailsAvailability?: string;
    }
    export interface VideoProcessingDetailsProcessingProgress {
        /*
         * The number of parts of the video that YouTube has already processed. You can estimate the percentage of the video that YouTube has already processed by
         * calculating:
         * 100 &#42; parts_processed / parts_total
         *
         * Note that since the estimated number of parts could increase without a corresponding increase in the number of parts that have already been processed,
         * it is possible that the calculated progress could periodically decrease while YouTube processes a video.
         */
        partsProcessed?: string;
        /*
         * An estimate of the total number of parts that need to be processed for the video. The number may be updated with more precise estimates while YouTube
         * processes the video.
         */
        partsTotal?: string;
        /* An estimate of the amount of time, in millseconds, that YouTube needs to finish processing the video. */
        timeLeftMs?: string;
    }
    export interface VideoProjectDetails {
        /* A list of project tags associated with the video during the upload. */
        tags?: string[];
    }

    export interface VideoRecordingDetails {
        /* The geolocation information associated with the video. */
        location?: GeoPoint;
        /* The text description of the location where the video was recorded. */
        locationDescription?: string;
        /* The date and time when the video was recorded. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sssZ) format. */
        recordingDate?: string;
    }
    export interface VideoSnippet {
        /* The YouTube video category associated with the video. */
        categoryId?: string;
        /* The ID that YouTube uses to uniquely identify the channel that the video was uploaded to. */
        channelId?: string;
        /* Channel title for the channel that the video belongs to. */
        channelTitle?: string;
        /* The default_audio_language property specifies the language spoken in the video's default audio track. */
        defaultAudioLanguage?: string;
        /* The language of the videos's default snippet. */
        defaultLanguage?: string;
        /* The video's description. */
        description?: string;
        /* Indicates if the video is an upcoming/active live broadcast. Or it's "none" if the video is not an upcoming/active live broadcast. */
        liveBroadcastContent?: string;
        /* Localized snippet selected with the hl parameter. If no such localization exists, this field is populated with the default snippet. (Read-only) */
        localized?: VideoLocalization;
        /* The date and time that the video was uploaded. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. */
        publishedAt?: string;
        /* A list of keyword tags associated with the video. Tags may contain spaces. */
        tags?: string[];
        /*
         * A map of thumbnail images associated with the video. For each object in the map, the key is the name of the thumbnail image, and the value is an object
         * that contains other information about the thumbnail.
         */
        thumbnails?: ThumbnailDetails;
        /* The video's title. */
        title?: string;
    }
    export interface VideoStatistics {
        /* The number of comments for the video. */
        commentCount?: string;
        /* The number of users who have indicated that they disliked the video by giving it a negative rating. */
        dislikeCount?: string;
        /* The number of users who currently have the video marked as a favorite video. */
        favoriteCount?: string;
        /* The number of users who have indicated that they liked the video by giving it a positive rating. */
        likeCount?: string;
        /* The number of times the video has been viewed. */
        viewCount?: string;
    }
    export interface VideoStatus {
        /* This value indicates if the video can be embedded on another website. */
        embeddable?: boolean;
        /* This value explains why a video failed to upload. This property is only present if the uploadStatus property indicates that the upload failed. */
        failureReason?: string;
        /* The video's license. */
        license?: string;
        /* The video's privacy status. */
        privacyStatus?: string;
        /*
         * This value indicates if the extended video statistics on the watch page can be viewed by everyone. Note that the view count, likes, etc will still be
         * visible if this is disabled.
         */
        publicStatsViewable?: boolean;
        /*
         * The date and time when the video is scheduled to publish. It can be set only if the privacy status of the video is private. The value is specified in
         * ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format.
         */
        publishAt?: string;
        /*
         * This value explains why YouTube rejected an uploaded video. This property is only present if the uploadStatus property indicates that the upload was
         * rejected.
         */
        rejectionReason?: string;
        /* The status of the uploaded video. */
        uploadStatus?: string;
    }
    export interface VideoSuggestions {
        /* A list of video editing operations that might improve the video quality or playback experience of the uploaded video. */
        editorSuggestions?: string[];
        /*
         * A list of errors that will prevent YouTube from successfully processing the uploaded video video. These errors indicate that, regardless of the video's
         * current processing status, eventually, that status will almost certainly be failed.
         */
        processingErrors?: string[];
        /* A list of suggestions that may improve YouTube's ability to process the video. */
        processingHints?: string[];
        /*
         * A list of reasons why YouTube may have difficulty transcoding the uploaded video or that might result in an erroneous transcoding. These warnings are
         * generated before YouTube actually processes the uploaded video file. In addition, they identify issues that are unlikely to cause the video processing
         * to fail but that might cause problems such as sync issues, video artifacts, or a missing audio track.
         */
        processingWarnings?: string[];
        /*
         * A list of keyword tags that could be added to the video's metadata to increase the likelihood that users will locate your video when searching or
         * browsing on YouTube.
         */
        tagSuggestions?: VideoSuggestionsTagSuggestion[];
    }
    export interface VideoSuggestionsTagSuggestion {
        /*
         * A set of video categories for which the tag is relevant. You can use this information to display appropriate tag suggestions based on the video
         * category that the video uploader associates with the video. By default, tag suggestions are relevant for all categories if there are no restricts
         * defined for the keyword.
         */
        categoryRestricts?: string[];
        /* The keyword tag suggested for the video. */
        tag?: string;
    }
    export interface VideoTopicDetails {
        /*
         * Similar to topic_id, except that these topics are merely relevant to the video. These are topics that may be mentioned in, or appear in the video. You
         * can retrieve information about each topic using Freebase Topic API.
         */
        relevantTopicIds?: string[];
        /* A list of Wikipedia URLs that provide a high-level description of the video's content. */
        topicCategories?: string[];
        /*
         * A list of Freebase topic IDs that are centrally associated with the video. These are topics that are centrally featured in the video, and it can be
         * said that the video is mainly about each of these. You can retrieve information about each topic using the Freebase Topic API.
         */
        topicIds?: string[];
    }

    export interface AccessPolicy {
        /* The value of allowed indicates whether the access to the policy is allowed or denied by default. */
        allowed?: boolean;
        /* A list of region codes that identify countries where the default policy do not apply. */
        exception?: string[];
    }

    export interface GeoPoint {
        /* Altitude above the reference ellipsoid, in meters. */
        altitude?: number;
        /* Latitude in degrees. */
        latitude?: number;
        /* Longitude in degrees. */
        longitude?: number;
    }
}

namespace GoogleCalendar {
    export interface Event {
        kind: 'calendar#event';
        etag: etag;
        id: string;
        status: string;
        htmlLink: string;
        created: datetime;
        updated: datetime;
        summary: string;
        description?: string;
        location: string;
        start: {
            date: date;
            dateTime: datetime;
            timeZone?: string;
        };
        end: {
            date: date;
            dateTime: datetime;
            timeZone?: string;
        };
        [key: string]: any; /* eslint-disable-line @typescript-eslint/no-explicit-any */
    }

    export interface EventsList {
        kind: 'calendar#events';
        etag: string;
        summary: string;
        description: string;
        updated: string;
        timeZone: string;
        accessRole: string;
        defaultReminders: [
            {
                method: string;
                minutes: number;
            }
        ];
        nextPageToken: string;
        nextSyncToken: string;
        items: Event[];
    }
}