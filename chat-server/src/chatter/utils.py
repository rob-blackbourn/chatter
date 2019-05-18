from datetime import datetime
import re

DATETIME_FORMATS = (
    ("%Y-%m-%dT%H:%M:%SZ", re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$'), None),
    ("%Y-%m-%dT%H:%M:%S.%fZ", re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$'), None),
    ("%Y-%m-%dT%H:%M:%S%z", re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$'),
     lambda s: s[0:-3] + s[-2:]),
    ("%Y-%m-%dT%H:%M:%S.%f%z", re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+[+-]\d{2}:\d{2}$'),
     lambda s: s[0:-3] + s[-2:])
)


def to_datetime(value):
    if isinstance(value, str):
        for fmt, pattern, transform in DATETIME_FORMATS:
            if pattern.match(value):
                s = transform(value) if transform else value
                return datetime.strptime(s, fmt)
    return None
