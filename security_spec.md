# InternTrack Security Specification & TDD Test Matrix

## 1. Data Invariants

1. **Identity & User Integrity**: Every attendance record and journal entry must reference a valid student.
2. **Status Transition Guarding**: Attendance status can only be one of `['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Tidak hadir']`.
3. **Journal Validation Gate**: Journal status transitions can only be `Menunggu Validasi`, `Disetujui`, or `Perlu Revisi`.
4. **ID Hardening**: All collection IDs must be alphanumeric strings up to 128 chars (`^[a-zA-Z0-9_\\-]+$`).
5. **No Unauthenticated Writes**: Write operations require authenticated session with Google or verified tokens.
6. **Administrator Privilege Escalation Protection**: Admin rights are pinned to the bootstrapped administrator (`adilaraisa429@gmail.com`) and designated entries in `/admins/`.

## 2. Dirty Dozen Payloads (Targeting Rejection)

1. **Junk ID Poisoning**: Document with 2KB string ID containing special symbols.
2. **Ghost Field Injection**: Adding `isAdmin: true` or `superUser: true` to a student record.
3. **Empty Journal Title**: Submitting a journal with empty title or invalid type.
4. **Excessive Length Journal Description**: Submitting > 10,000 characters payload to exhaust resources.
5. **Unverified Timestamp Spoofing**: Submitting arbitrary timestamps instead of standard dates.
6. **Attendance Status Poisoning**: Setting status to `Bebas` or arbitrary non-enum value.
7. **Orphan Attendance Record**: Submitting attendance without `studentId`.
8. **Negative Capacity Injection**: Setting company capacity to negative number or string.
9. **Fake Announcement Priority**: Priority set to `Kritis` or non-standard enum.
10. **Oversized Message Payload**: Sending > 10,000 characters text message.
11. **Direct Admin Collection Write by Regular Student**: Unauthorized creation of admin record.
12. **Malformed Attachment Injection**: Malformed attachment array exceeding bounded limits.
